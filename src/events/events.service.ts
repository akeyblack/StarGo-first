import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThanOrEqual, MoreThan, LessThan } from 'typeorm';
import { TwitterService } from '../twitter/twitter.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PlaceEvent } from './entities/event.entity';
import { FilesService } from '../files/files.service';
import { Bucket } from '../types/aws-bucket.enum';
import { PlacesService } from '../places/places.service';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(PlaceEvent)
    private readonly eventsRepository: Repository<PlaceEvent>,
    private readonly twitterService: TwitterService,
    private readonly filesService: FilesService,
    private readonly placesService: PlacesService,
    private readonly configService: ConfigService,
  ) {}

  async createEvent(createEventDto: CreateEventDto, img: Express.Multer.File): Promise<string> {
    if (moment(
      createEventDto.date + ' ' + createEventDto.start, "YYYY-MM-DD HH:mm"
    ).diff(moment(Date.now())) < 0 )
      throw new BadRequestException("Your event's start time passed");
      
    const isExists = await this.eventsRepository.count({
      where: [{
        date: createEventDto.date,
        start: MoreThan(createEventDto.start),
        end: LessThan(createEventDto.end)
      }, {
        date: createEventDto.date,
        start: LessThan(createEventDto.start),
        end: MoreThan(createEventDto.end)
      }, {
        date: createEventDto.date,
        start: LessThan(createEventDto.start),
        end: MoreThan(createEventDto.start)
      }, {
        date: createEventDto.date,
        start: LessThan(createEventDto.end),
        end: MoreThan(createEventDto.end)
      }]
    })

    if(isExists)
      throw new BadRequestException('Event already exists on that date and time');

    const place = await this.placesService.getPlaceById(createEventDto.placeId);

    if(!place)
      throw new BadRequestException("Place with that id doesn't exists");

    const event = await this.eventsRepository.save({
      ...createEventDto,
      place,
      guests: 0,
      placeId: undefined,
    });

    try {
      await this.filesService.uploadFile(img, event.id, Bucket.get().EVENT_IMG);
    }
    catch (err){
      await this.eventsRepository.delete(event.id);
      throw new InternalServerErrorException("Can't create this event right now. Try again later");
    }

    this.twitterService.createPostWithImg(
      `${event.name}\n${event.description}\n\n${event.date}\n${event.start + '-' + event.end}` + 
      `\n${event.place.name}\n${event.place.address.city + ", " + event.place.address.other}`,
      img
     )
    .catch();

    return event.id;
  }

  async addUser(id: string): Promise<number> {
    const [date, time] = new Date().toISOString().slice(0, 19).replace('T', ' ').split(' ');
    
    const event = await this.eventsRepository.findOne({
      where: [{
        id,
        date: MoreThan(date),
      }, {
        id,
        date: MoreThanOrEqual(date),
        end: MoreThan(time)
      }]
    });

    if(!event)
      throw new NotFoundException(`Event with id: ${id} doesn't exists or already passed`);

    await this.eventsRepository.update(id, {guests: ++event.guests})

    return event.guests;
  }

  async getEventImage(id: string): Promise<string> {
    return this.filesService.getUrl(Bucket.get().EVENT_IMG, id, 3600*6)
  }
}