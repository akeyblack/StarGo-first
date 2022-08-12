import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Content } from './entities/content.entity';
import { FilesService } from '../files/files.service';
import { FileType } from '../types/file.type';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentsRepository: Repository<Content>,
    private readonly filesService: FilesService,
  ) {}


  async getAll(): Promise<Content[]>{
    return this.contentsRepository.find();
  }
  
  async uploadFile(file: FileType): Promise<Content> {
    const content = {
      filename: file.originalname,
      type: file.type,
      subtype: file.subtype,
      date: new Date(),
      size: file.size,
      extension: file.extension,
    };
    const {id} = await this.contentsRepository.save(content);

    try {
      await this.filesService.uploadFile(file as Express.Multer.File, id);
    } catch (err) {
      await this.contentsRepository.delete({id});
      throw new InternalServerErrorException();
    }

    return {id, ...content};
  }
  
}

//todo date