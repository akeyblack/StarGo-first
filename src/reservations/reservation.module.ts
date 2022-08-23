import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { MailsModule } from '../mails/mails.module';
import { TelegramModule } from "src/telegram/telegram.module";
import { ReservationsService } from './reservation.service';
import { PlacesModule } from '../places/places.module';
import { ReservationsController } from './reservation.controller';

@Module({
  providers: [
    ReservationsService,
  ],
  controllers: [
    ReservationsController,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
    ]),
    MailsModule,
    PlacesModule,
    forwardRef(() => TelegramModule),
  ],
  exports: [
    ReservationsService,
  ]
})
export class ReservationsModule {}