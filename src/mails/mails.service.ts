import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MailsService {
  constructor(
    private readonly mailerService: MailerService
  ) {}

  async sendEmail(to: string, filename: string): Promise<boolean> {
    return await this.mailerService
    .sendMail({
      to,
      subject: `File "${filename}" transcripted`,
      html: '<p>Click <a href="https://stargo-first.herokuapp.com/contents/' + filename + '">here</a> to get a transcription text</p>',
    })
  }


}