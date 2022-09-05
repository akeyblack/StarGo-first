import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Place } from './entities/place.entity';
import { LessThanOrEqual, Like, MoreThanOrEqual, Raw, Repository } from 'typeorm';
import { ScraperService } from '../scraper/scraper.service';
import { MailsService } from '../mails/mails.service';
import { Address } from './entities/address.entity';
import { ScraperStatus } from '../types/scraper-status.enum';
import moment from "moment";
import { Week } from '../types/week.enum';
import { addToTime } from '../utils/time.utils';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,
    @InjectRepository(Address)
    private readonly addressesRespository: Repository<Address>,
    private readonly scraperService: ScraperService,
    private readonly mailsService: MailsService,
  ) {}


  async saveDataByCity(city: string, email?: string): Promise<ScraperStatus> {
    const savedUrls = await this.getPlacesUrlsByCity(city);

    if(savedUrls.length)
      return ScraperStatus.COMPLETED;

    if(await this.addressesRespository.countBy({city: 'stop'}))
      return ScraperStatus.IN_PROCESS;
    await this.addressesRespository.save({city: 'stop', other: ''});    // to prevent repeatable requests

    const placesUrls = (await Promise.all(
      [0,1,2,3,4].map(i => 
        this.scraperService.getPlacesUrls(this.scraperService.placesListUrl(city, i), i*1500)
      )
    )).flat(1);

    const promises = placesUrls.map((url, i) => {
      return this.scraperService.getDataFromUrl(url, i*6000)
    });

    const places = (await Promise.allSettled(promises))
    .reduce((array, el) => {
      if(el.status==='rejected')
        return;
      const place = {
        ...el.value,
        address: {
          city,
          other: el.value.address
        },
        amenities: el.value.amenities.join(', '),
        workingHours: el.value.workingHours.reduce(
          (array, el: string, i) => {
            const hour = this.strWorkingHoursToEntity(el, i)
            if(hour)
              array.push(hour);
            return array;
          }, []
        )
      }
      array.push(place);
      return array;
    }, [])


    try {
      await this.addressesRespository.delete({city: 'stop'});
      await this.placesRepository.save(places);
    } catch (err) {
      if(email)
        await this.mailsService.sendEmail(
          email, 
          '<p>Something went wrong! Click <a href="https://stargo-first.herokuapp.com/places/upload/' + city + '">here</a> to repeat request</p>'
        );
        return ScraperStatus.COMPLETED;
    }

    try {
      if(email)
        await this.mailsService.sendEmail(
          email, 
          '<p>Click <a href="https://stargo-first.herokuapp.com/places/upload/' + city + '">here</a> to get your data text</p>'
        );
    } catch (err) {}

    return ScraperStatus.COMPLETED;
  }

  async getPlacesByCriterias(city?: string, amenities?: string[], hour?: {day: string, time: string}): Promise<Place[]> {
    const whereObj = {};

    if(city)
      whereObj['address'] = {city}

    if(hour) {
      const prevDayId = Week[hour.day]-1;
      const prevDay =  Week[(prevDayId===-1) ? 6 : prevDayId];

      whereObj['workingHours'] = [{
        start: LessThanOrEqual(addToTime(hour.time, 0)),
        end: MoreThanOrEqual(addToTime(hour.time, 0)),
        day: hour.day
      }, {
        start: LessThanOrEqual(addToTime(hour.time, 24)),
        end: MoreThanOrEqual(addToTime(hour.time, 24)),
        day: prevDay
      }]
    }

    if(amenities)
      whereObj['amenities'] = Raw(alias => `${alias} LIKE '%${amenities[0]}%' AND ${alias} LIKE '%${amenities[1]}%'`)

    return this.placesRepository.find({
      relations: {
        address: true,
        workingHours: true
      },
      where: whereObj
    });
  }

  async getPlacesByCity(city: string): Promise<Place[]> {
    return this.placesRepository.find({
      relations: {
        address: true
      },
      where: {
        address: {
          city
        }
      },
    });
  }

  async getPlacesByCityAndName(city: string, name: string): Promise<Place[]> {
    return this.placesRepository.find({
      relations: {
        address: true
      },
      where: {
        address: {
          city
        },
        name: Like(`%${name}%`)
      },
    });
  }

  async isOpenedById(id: string, day: string, time: string): Promise<boolean> {
    const prevDayId = Week[day]-1;
    const prevDay =  Week[(prevDayId===-1) ? 6 : prevDayId];

    return !!(await this.placesRepository.count({
      relations: {
        workingHours: true
      },
      where: {
        id,
        workingHours: [{
          start: LessThanOrEqual(addToTime(time, 0)),
          end: MoreThanOrEqual(addToTime(time, 0)),
          day: day
        }, {
          start: LessThanOrEqual(addToTime(time, 24)),
          end: MoreThanOrEqual(addToTime(time, 24)),
          day: prevDay
        }]
      }
    }))
  }

  async getPlaceById(id: string): Promise<Place> {
    return this.placesRepository.findOne({
      where: { id },
      relations: {
        address: true,
        workingHours: true
      }
     });
  }

  private async getPlacesUrlsByCity (city: string): Promise<string[]> {
    return (await this.placesRepository.find({
      relations: {
        address: true
      },
      where: {
        address: {
          city
        }
      },
      select: {
        url: true
      }
    }))
    .map(el => el.url)
  }

  private strWorkingHoursToEntity (hours: string, day: number): null | { day: string, start: string, end: string } {
    if(hours==='Closed')
      return null;

    const [h1, h2] = hours.split(' - ');

    const [m1, m2] = [
      moment(h1, ["h:mm A"]),
      moment(h2, ["h:mm A"])
    ];

    let t2: string;

    if(m2.diff(m1, 'hours') < 0) {
      const dur = moment.duration(m2.format('HH:mm'), 'hours').add(24, 'hours');
      const hours = Math.floor(dur.asHours());
      const mins  = Math.floor(dur.asMinutes()) - hours * 60;
      t2 = hours + ':' + ((mins>9) ? mins : '0' + mins);
    } else
      t2 = m2.format('HH:mm');

    const t1 = m1.format('HH:mm');

    return {
      day: String(Week[day]),
      start: t1,
      end: t2
    }    
  }
}
