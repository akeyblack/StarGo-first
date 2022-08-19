import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';


export const PlacesQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    
    const query = request.query;

    const result = {};

    if(query.city)
      result['city'] = query.city;
    
    if(query.amenities) {
      const array = String(query.amenities).split(',');
      if(array.length == 2)
        result['amenities'] = array
      else
        result['amenities'] = ['',  String(query.amenities)]
    }

    if(query.hour)
      result['hour'] = {
        day: String(query.hour).split('_')[0],
        time: String(query.hour).split('_')[1]
      }
    
    return result;
  },
);

export type PlacesQueryType = {
  city?: string,
  amenities?: string[],
  hour?: {
    day: string,
    time: string,
  }
}