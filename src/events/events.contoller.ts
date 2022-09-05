import { Body, Controller, Get, Param, Post, Redirect, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateEventDto } from './dto/create-event.dto';
import { ImgValidationPipe } from '../pipes/img-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService
  ) {}


  @Post()
  @UsePipes(ImgValidationPipe, ValidationPipe)
  @UseInterceptors(FileInterceptor('file'))
  async createEvent(@Body() createEventDto: CreateEventDto, @UploadedFile() file: Express.Multer.File): Promise<string> {
    return this.eventsService.createEvent(createEventDto, file);
  }

  @Get(':id')
  async addUser(@Param('id') id: string): Promise<number> {
    return this.eventsService.addUser(id)
  }

  @Get('img/:id')
  @Redirect()
  async getImage(@Param('id') id: string) {
    return {
      url: await this.eventsService.getEventImage(id)
    };
  }
}