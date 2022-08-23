import { Module, forwardRef } from '@nestjs/common';
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramUser } from './entities/telegram-user.entity';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from "./telegram.update";
import { MakeReservationScene } from "./scenes/make-reservation.scene";
import { PlacesModule } from '../places/places.module';
import { session } from "telegraf";
import { ReservationsModule } from '../reservations/reservation.module';

@Module({
  providers: [
    TelegramService,
    TelegramUpdate,
    MakeReservationScene,
  ],
  imports: [
    TypeOrmModule.forFeature([
      TelegramUser,
    ]),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('telegram'),
        middlewares: [session()],
      }),
    }),
    PlacesModule,
    forwardRef(() => ReservationsModule),
  ],
  exports: [
    TelegramService,
  ]
})
export class TelegramModule {}