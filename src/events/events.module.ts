import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterModule } from '../twitter/twitter.module';
import { FilesModule } from '../files/files.module';
import { PlaceEvent } from './entities/event.entity';
import { EventsController } from './events.contoller';

@Module({
  providers: [
    EventsService,
  ],
  controllers: [
    EventsController,
  ],
  imports: [
    TypeOrmModule.forFeature([
      PlaceEvent,
    ]),
    TwitterModule,
    FilesModule,
  ],
  exports: [
    EventsService,
  ]
})
export class EventsModule {}