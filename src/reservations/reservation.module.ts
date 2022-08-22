import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { MailsModule } from '../mails/mails.module';
import { TelegramModule } from "src/telegram/telegram.module";
import { ReservationsService } from './reservation.service';
import { PlacesModule } from '../places/places.module';

@Module({
  providers: [
    ReservationsService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
    ]),
    MailsModule,
    TelegramModule,
    PlacesModule
  ]
})
export class ReservationsModule {}