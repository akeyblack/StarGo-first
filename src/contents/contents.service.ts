import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Content } from './entities/content.entity';
import { FilesService } from '../files/files.service';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentsRepository: Repository<Content>,
    private readonly filesService: FilesService,
  ) {}
  
  async uploadFile(file: Express.Multer.File): Promise<Content> {
    const content = {
      filename: file.filename,
      mimetype: file.mimetype,
      date: Date.now(),
      url: '',
    };
    const saved = await this.contentsRepository.save(content);

    try {
      content.url = await this.filesService.uploadFile(file, saved.id);
    } catch (err) {
      await this.contentsRepository.delete({id: saved.id});
      throw new InternalServerErrorException();
    }
    
    await this.contentsRepository.update({id: saved.id}, {url: content.url});

    return {...saved, url};
  }
  
}