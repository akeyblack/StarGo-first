import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { MailsModule } from '../mails/mails.module';

@Module({
  providers: [FilesService],
  controllers: [],
  imports: [MailsModule],
  exports: [FilesService]
})
export class FilesModule {}