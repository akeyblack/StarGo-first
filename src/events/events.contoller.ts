import { Controller, Get, Param, Post, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateEventDto } from './dto/create-event.dto';
import { ImgValidationPipe } from '../pipes/img-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { PlaceEvent } from './entities/event.entity';
import { UserIP } from "src/utils/user-ip.decorator";

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService
  ) {}


  @Post()
  @UsePipes(ImgValidationPipe, ValidationPipe)
  @UseInterceptors(FileInterceptor('img'))
  async createEvent(createEventDto: CreateEventDto, @UploadedFile() img: Express.Multer.File): Promise<PlaceEvent> {
    return this.eventsService.createEvent(createEventDto, img);
  }

  @Get(':id')
  async addUser(@Param('id') id: string, @UserIP() user: string): Promise<number> {
    return this.eventsService.addUser(id, user)
  }

}