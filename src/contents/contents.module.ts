import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentsController } from './contents.controller';
import { Content } from './entities/content.entity';
import { ContentsService } from './contents.service';
import { FilesModule } from '../files/files.module';

@Module({
  providers: [ContentsService],
  controllers: [ContentsController],
  imports: [
    TypeOrmModule.forFeature([
      Content,
    ]),
    FilesModule,
  ]
})
export class ContentsModule {}