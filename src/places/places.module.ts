import { Module } from "@nestjs/common";
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Address } from './entities/address.entity';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  providers: [PlacesService],
  controllers: [PlacesController],
  imports: [
    TypeOrmModule.forFeature([
      Place,
      Address,
    ]),
    ScraperModule
  ]
})
export class PlacesModule {}