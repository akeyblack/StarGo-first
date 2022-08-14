import { Controller, Get, Param, Post, UploadedFile, UseInterceptors, UsePipes } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentsService } from './contents.service';
import { Content } from './entities/content.entity';
import { FileValidationPipe } from '../pipes/file-validation.pipe';
import { FileType } from '../types/file.type';

@Controller('contents')
export class ContentsController {
  constructor(
    private readonly contentsService: ContentsService,
  ) {}

  @Get()
  async getAll(): Promise<Content[]> {
    return this.contentsService.getAll();
  }

  @Post('upload')
  @UsePipes(FileValidationPipe)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: FileType): Promise<string> {
    return this.contentsService.uploadFile(file);
  }

  @Get(':id')
  async getText(@Param('id') filename: string): Promise<string> {
    return this.contentsService.getTextByName(filename);
  }
}
