import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from './files/files.module';
import { ContentsModule } from './contents/contents.module';
import { PlacesModule } from './places/places.module';
import { ScraperModule } from './scraper/scraper.module';
import { TelegramModule } from './telegram/telegram.module';
import { ReservationsModule } from './reservations/reservation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    FilesModule,
    ContentsModule,
    PlacesModule,
    ScraperModule,
    TelegramModule,
    ReservationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
