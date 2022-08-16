import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  providers: [MailsService],
  controllers: [],
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: configService.get('mail').access,
        defaults: {
          from: configService.get('mail').from
        }
      })
    })
  ],
  exports: [MailsService]
})
export class MailsModule {}