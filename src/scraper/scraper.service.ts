import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { load } from "cheerio";
import { PlaceDto } from '../places/dto/place.dto';
import { prom } from '../utils/timeout-promise.utils';

@Injectable()
export class ScraperService {
  constructor(
    private readonly httpService: HttpService
  ) {}


  placesListUrl = (city: string, page: number) => `https://www.yelp.com/search?find_loc=${city}&start=${page*10}`;


  async getPlacesUrls(placesListUrl: string, timeout: number): Promise<{url: string, name: string}[]> {
    await prom(null, timeout);
    const response = await this.httpService.axiosRef.get(placesListUrl);
    const urlArray = [];
    const $ = load(response.data);

    $('h3.css-1yx1rzi a').each((i, el) => {
      urlArray.push({
        url: 'https://www.yelp.com' + el['attribs'].href,
        name: el['attribs'].name
      });
    });

    return urlArray;
  }


  async getDataFromUrl(data: {url: string, name: string}, timeout: number): Promise<PlaceDto> {
    await prom(null, timeout);
    let response: AxiosResponse;
    let $: cheerio.Root;
    try {
      response = await this.httpService.axiosRef.get(data.url);
      $ = load(response.data);
    } catch (err){
      return this.getDataFromUrl(data, 2000);
    }

    const description = $("[aria-label='About the Business']").find('span:not([style],[width])').contents().text().split('Read more')[0];
    
    const amenities: string[] = [];
    $("[aria-label='Amenities and More']").find('span.css-1p9ibgf').each((i, el) => {
      const data = el['children'][0].data;
      if(data)
        amenities.push(data);
    });

    const workingHours: string[] =  [];
    $('table.hours-table__09f24__KR8wh').find('.no-wrap__09f24__c3plq.css-1p9ibgf').each((i, el) => {
      workingHours.push(el['children'][0].data);
    });

    const phone = $('.css-na3oda:contains("Phone number")').next().contents().text().replace(/\s/g,'');

    const images = [];
    $('img.photo-header-media-image__09f24__A1WR_').each((i, el) => {
      if(i>2)
        return;
      images.push(el['attribs'].src);
    });

    const review = $('.review__09f24__oHr9V');
    let highestRated = "";
    try {
      highestRated = String(review.find('.i-stars__09f24__M1AR7').first().attr()['aria-label']) + ": " +
        String(review.find('.raw__09f24__T4Ezm').first().contents().text())
    } catch (err) {}

    const lowestRated = await this.getLowestRatedByUrl(data.url);

    const stars = $('.i-stars__09f24__M1AR7').first();
    let rating = Number(
      stars ? stars.attr()['aria-label'].split(' ')[0] : 0
    );
    if(!rating)
      rating = 0;

    const address = String($('.raw__09f24__T4Ezm').first().contents().text());

    return {
      name: data.name,
      url: data.url,
      description,
      amenities,
      workingHours: workingHours.join(),
      phone,
      images,
      lowestRated,
      highestRated,
      rating,
      address
    };
  }

  private async getLowestRatedByUrl(url: string): Promise<string> {
    await prom(null, 2000);
    let response: AxiosResponse;
    let $: cheerio.Root;
    try {
      response = await this.httpService.axiosRef.get(url + "?sort_by=rating_asc");
      $ = load(response.data);
    } catch {
      return this.getLowestRatedByUrl(url);
    }

    const review = $('.review__09f24__oHr9V');
    let rated = "";
  
    try {
      rated = String(review.find('.i-stars__09f24__M1AR7').first().attr()['aria-label']) + ": " +
        String(review.find('.raw__09f24__T4Ezm').first().contents().text())
    } catch (err) {}
    
    return rated;
  }
}