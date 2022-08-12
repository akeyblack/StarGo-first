import { plainToClass } from 'class-transformer';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {

    const file: Express.Multer.File = plainToClass(metadata.metatype, value);

    if(!(file && file.mimetype && file.size))
      throw new BadRequestException("Bad format");

    if(file.originalname.length > 300) {
      throw new BadRequestException("Filename length must be up to 100");
    }

    const [type, format] = file.mimetype.split('/');
    switch(type) {
      case 'audio':
        if(file.size > 25*1024*1024)
          throw new BadRequestException("Audio files must be up to 25mb in size");
        break;
      case 'video':
        if(file.size > 100*1024*1024)
          throw new BadRequestException("Video files must be up to 100mb in size")
        break;
      default: 
        throw new BadRequestException("Bad format");
    }

    value.type = type;
    value.subtype = format;
    value.extension = file.originalname.split('.').pop();
    
    return value;
  }
}
  