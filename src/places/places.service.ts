import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';
import { ScraperService } from '../scraper/scraper.service';
import { writeFileSync } from 'fs';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,
    private readonly scraperService: ScraperService
  ) {}


  async getDataByCity(city: string): Promise<string> {
    const result = await this.scraperService.getDataByCity(city);
    console.log(result.filter(el => el===null).length)
    writeFileSync('./file.json',JSON.stringify(result, null, '\t'));
    return "Abc";
  }

  private async saveData(places: string[]): Promise<boolean> {
    return true;
  }
}
