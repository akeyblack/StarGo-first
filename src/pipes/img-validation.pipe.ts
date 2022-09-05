import { plainToClass } from 'class-transformer';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ImgValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    if(metadata.type !== 'custom')
      return value;

    const file: Express.Multer.File = plainToClass(metadata.metatype, value);

    if(!file)
      throw new BadRequestException("Image is a must");

    if(!(file && file.mimetype && file.size))
      throw new BadRequestException("Bad image format");

    if(file.originalname.length > 300) {
      throw new BadRequestException("Filename length must be up to 300");
    }

    if(file.size > 5*1024*1024)
      throw new BadRequestException("Imgs must be up to 5mb in size");

    if(file.mimetype.split('/')[0] !== 'image')
      throw new BadRequestException("Wrong format, must be an image");

    return value;
  }
}
  