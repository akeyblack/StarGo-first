import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { load } from "cheerio";
import { PlaceDto } from '../places/dto/place.dto';
import { prom } from '../utils/timeout-promise.utils';

@Injectable()
export class ScraperService {
  constructor(
    private readonly httpService: HttpService
  ) {}

  private placesListUrl = (city: string, page: number) => `https://www.yelp.com/search?find_loc=${city}&start=${page*10}`;


  async getDataByCity(city: string): Promise<PlaceDto[]> {
    const urlArray = (await Promise.all(
      [0,1,2,3,4].map(i => this.getPlacesUrls(this.placesListUrl(city, i)))
    )).flat(1);

    console.log(urlArray)

    const promises = urlArray.map((url, i) => {
      try {
        const result = this.getDataFromUrl(url, i*2000)
        return result;
      } catch (err) {}
      return;
    });
    //const promises = [this.getDataFromUrl(urlArray[0])];
    return (await Promise.allSettled(promises)).map(el => {
      if(el.status==='rejected')
        return;
      return el.value;
    });
  }


  private async getPlacesUrls(placesListUrl: string): Promise<{url: string, name: string}[]> {
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


  private async getDataFromUrl(data: {url: string, name: string}, timeout: number): Promise<PlaceDto> {
    prom(null, timeout);
    const response = await this.httpService.axiosRef.get(data.url);

    const $ = load(response.data);

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
    const rating = Number(
      stars ? stars.attr()['aria-label'].split(' ')[0]: 0
    )

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
    const response = await this.httpService.axiosRef.get(url + "?sort_by=rating_asc");

    const $ = load(response.data);
    const review = $('.review__09f24__oHr9V');
    let rated = "";
  
    try {
      rated = String(review.find('.i-stars__09f24__M1AR7').first().attr()['aria-label']) + ": " +
        String(review.find('.raw__09f24__T4Ezm').first().contents().text())
    } catch (err) {}
    
    return rated;
  }
}