import { Controller, Get, Param } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService
  ) {}


  @Get(':city')
  async getDataByCity(@Param('city') city: string):Promise<string> {
    const time = Date.now();
    await this.placesService.getDataByCity(city);
    console.log(Date.now() - time)
    return "abc";
  }
}
