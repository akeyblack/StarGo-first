import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MailsService {
  constructor(
    private readonly mailerService: MailerService
  ) {}

  async sendEmail(to: string, message: string): Promise<boolean> {
    return await this.mailerService
    .sendMail({
      to,
      subject: `My app notification!`,
      html: message,
    })
  }


}