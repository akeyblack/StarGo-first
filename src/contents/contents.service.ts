import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Content } from './entities/content.entity';
import { FilesService } from '../files/files.service';
import { FileType } from '../types/file.type';
import { Transcription } from './entities/transcription.entity';
import { ContentStatus } from "../types/content-status.enum";
import { Bucket } from '../types/aws-bucket.enum';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentsRepository: Repository<Content>,
    @InjectRepository(Transcription)
    private readonly transcriptionsRepository: Repository<Transcription>,
    private readonly filesService: FilesService,
  ) {}
  
  async uploadFile(file: FileType): Promise<string> {
    const content = {
      filename: file.originalname,
      type: file.type,
      mimetype: file.mimetype,
      date: new Date(),
      size: file.size,
      extension: file.extension,
      uri: "",
      statusCode: ContentStatus.NOT_TRANSCRIBED,
      transcription: {
        text: "",
        content: null,
      },
    };
    content.transcription.content = content;

    const isExists = await this.contentsRepository.findOneBy({filename: content.filename});

    if(isExists)
      throw new BadRequestException("Filename already exists");

    const {id} = await this.contentsRepository.save(content);

    try {
      content.uri = await this.filesService.uploadAndConvertToMp3File(file as Express.Multer.File, id, Bucket.get().CONTENT_FILE);
    } catch (err) {
      await this.contentsRepository.delete({id}); 
      throw err;
    }
    
    await this.contentsRepository.update({id}, {uri: content.uri})

    return content.filename;
  }

  async getTextByName(filename: string, email?: string): Promise<string> {
    const content = await this.contentsRepository.findOneBy({filename});
    if(!content)
      throw new NotFoundException(`Object with filename: ${filename} doesn't exist`);

    switch(content.statusCode) {
      case ContentStatus.TRANSCRIBED:
        return content.transcription.text;
        
      case ContentStatus.NOT_TRANSCRIBED:
        await this.contentsRepository.update({filename}, {statusCode: ContentStatus.IN_PROCESS})
        try {
          const text = await this.filesService.getText(content, email);

          await this.transcriptionsRepository.update({id: content.transcription.id}, {text});
          await this.contentsRepository.update({filename}, {statusCode: ContentStatus.TRANSCRIBED})
          
          return text;
        } catch (err) {
          await this.contentsRepository.update({filename}, {statusCode: ContentStatus.NOT_TRANSCRIBED})
        }

      case ContentStatus.IN_PROCESS:
        return "Transcription in process"

      default:
        throw new InternalServerErrorException();
    }
  }
}