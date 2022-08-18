import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';
import { ScraperService } from '../scraper/scraper.service';
import { MailsService } from '../mails/mails.service';
import { Address } from './entities/address.entity';
import { ScraperStatus } from '../types/scraper-status.enum';

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
    await this.addressesRespository.save({city: 'stop', other: ''});    // for preventing repeatable requests

    const placesUrls = (await Promise.all(
      [0,1,2,3,4].map(i => 
        this.scraperService.getPlacesUrls(this.scraperService.placesListUrl(city, i), i*1500)
      )
    )).flat(1);

    const promises = placesUrls.map((url, i) => {
      return this.scraperService.getDataFromUrl(url, i*5000)
    });

    const places = (await Promise.allSettled(promises))
    .map(el => {
      if(el.status==='rejected')
        return;
      
      const place = {
        ...el.value,
        address: {
          city,
          other: el.value.address
        }
      }
      return place;
    })
    .filter(el => el);

    try {
      await this.placesRepository.save(places);
      await this.addressesRespository.delete({other: 'test'});
    } catch (err) {
      if(email)
        await this.mailsService.sendEmail(
          email, 
          '<p>Something went wrong! Click <a href="https://stargo-first.herokuapp.com/places/' + city + '">here</a> to repeat request</p>'
        );
    }

    try {
      if(email)
        await this.mailsService.sendEmail(
          email, 
          '<p>Click <a href="https://stargo-first.herokuapp.com/places/' + city + '">here</a> to get your data text</p>'
        );
    } catch (err) {}

    return ScraperStatus.COMPLETED;
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
}
