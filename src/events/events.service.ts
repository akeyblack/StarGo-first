import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { TwitterService } from '../twitter/twitter.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PlaceEvent } from './entities/event.entity';
import { FilesService } from '../files/files.service';
import { Bucket } from '../types/aws-bucket.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(PlaceEvent)
    private readonly eventsRepository: Repository<PlaceEvent>,
    private readonly twitterService: TwitterService,
    private readonly filesService: FilesService
  ) {}

  async createEvent(createEventDto: CreateEventDto, img: Express.Multer.File): Promise<PlaceEvent> {
    const isExists = await this.eventsRepository.count({
      where: [{
        date: createEventDto.date,
        start: LessThanOrEqual(createEventDto.start),
        end: LessThanOrEqual(createEventDto.end)
      }, {
        date: createEventDto.date,
        start: MoreThanOrEqual(createEventDto.start),
        end: LessThanOrEqual(createEventDto.end)
      }, {
        date: createEventDto.date,
        start: LessThanOrEqual(createEventDto.start),
        end: MoreThanOrEqual(createEventDto.end)
      },{
        date: createEventDto.date,
        start: MoreThanOrEqual(createEventDto.start),
        end: MoreThanOrEqual(createEventDto.end)
      }]
    })

    if(isExists)
      throw new BadRequestException('Event already exists on that date and time');

    const event = await this.eventsRepository.save(createEventDto);

    try {
      await this.filesService.uploadFile(img, event.id, Bucket.EVENT_IMG);
    }
    catch {
      await this.eventsRepository.delete(event.id);
      throw new InternalServerErrorException("Can't create this event right now. Try again later");
    }

    this.twitterService.createPost()
    .catch();

    return event;
  }

  async addUser(id: string, user: string): Promise<number> {
    console.log(user);
    const event = await this.eventsRepository.findOneBy({id});

    if(!event)
      throw new NotFoundException(`Event with id: ${id} doesn't exists`);

    const {guests} = event;

    if(guests.includes(user))
      throw new BadRequestException("You've already marked this as 'I will go'");

    const count = user ? guests.push(user): guests.length;

    await this.eventsRepository.update(id, {guests})

    return count;
  }
}