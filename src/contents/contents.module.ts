import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentsController } from './contents.controller';
import { Content } from './entities/content.entity';
import { ContentsService } from './contents.service';

@Module({
  providers: [ContentsService],
  controllers: [ContentsController],
  imports: [TypeOrmModule.forFeature([
    Content
  ])],
})
export class ContentsModule {}