import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlacesService } from './places.service';
import { Place } from './entities/place.entity';
import { prom } from '../utils/timeout-promise.utils';
import { ScraperStatus } from '../types/scraper-status.enum';

@Controller('places')
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
  ) {}


  @Get(':city')
  async getDataByCity(@Param('city') city: string, @Query('email') email?: string):Promise<Place[] | string> {
    const result = await Promise.race([
      this.placesService.saveDataByCity(city, email),
      prom(false, 5000)
    ]);

    switch(result) {
      case ScraperStatus.COMPLETED:
        return this.placesService.getPlacesByCity(city);

      case ScraperStatus.IN_PROCESS:
        return "Someone started parsing. Please, Wait!";

      default: 
        if(email)
        return `We will send email on ${email} when it's over`;
          else
        return "Parsing started";
    }
  }
}
