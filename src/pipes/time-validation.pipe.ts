import { plainToClass } from 'class-transformer';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class IntervalValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {

    const obj: {start: string, end: string} = plainToClass(metadata.metatype, value);
    if(!obj.start || !obj.end)
      return value;

    if(!moment(obj.start,"HH:mm", true).isValid() || !moment(obj.end,"HH:mm", true).isValid() )
      throw new BadRequestException("Bad time format");
    
    if(moment(obj.start,"HH:mm").diff(moment(obj.end,"HH:mm")) >= 0)
      throw new BadRequestException("Start > End");
   
    return value;
  }
}
  