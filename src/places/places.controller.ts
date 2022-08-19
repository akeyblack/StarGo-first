import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlacesService } from './places.service';
import { Place } from './entities/place.entity';
import { prom } from '../utils/timeout-promise.utils';
import { ScraperStatus } from '../types/scraper-status.enum';
import { PlacesQuery, PlacesQueryType } from './places-query.decorator';

@Controller('places')
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
  ) {}

  @Get()
  async getPlacesByQuery(@PlacesQuery() query: PlacesQueryType): Promise<Place[]> {
    return this.placesService.getPlacesByCriterias(query.city, query.amenities, query.hour);
  }


  @Get('upload/:city')
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
