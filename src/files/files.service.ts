import { StartTranscriptionJobCommand, TranscribeClient } from "@aws-sdk/client-transcribe";
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from "aws-sdk";
import * as ffmpeg from "fluent-ffmpeg";
import { Content } from "src/contents/entities/content.entity";
import { PassThrough, Readable } from 'stream';


@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService
  ) {
    const aws = this.configService.get('aws');
    this.fileBucketName = aws.fileBucketName;
    this.textBucketName = aws.textBucketName;

    this.s3 = new S3({
      ...aws.credentials,
      region: aws.region
    });

    this.transcribeClient = new TranscribeClient({
      credentials: aws.credentials,
      region: aws.region
    });
  }

  private fileBucketName: string;
  private textBucketName: string;
  private s3: S3;
  private transcribeClient: TranscribeClient;


  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const pass = await this.convertToWavPassThrough(file.buffer);
  
    const params = {
      Bucket: this.fileBucketName,
      Key: key,
      Body: pass,
      ContentType: file.mimetype,
    }

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }


  async getText(content: Content): Promise<string> {
    const params = {
      Bucket: this.textBucketName,
      Key: content.id + '.json'
    }

    try {
      await this.s3.headObject(params).promise();
    } catch (err) {
      if(err.name === 'NotFound') {
        await this.transcribe(content);
        await this.s3.waitFor('objectExists', params).promise();
      } else 
        throw new InternalServerErrorException();
    }

    const response = this.s3.getObject(params);

    const stringBody = (await response.promise()).Body.toString('utf-8');
    const transcriptArray =  JSON.parse(stringBody).results.transcripts;

    return transcriptArray.reduce(
      (str: string, el: {transcript: string}) => 
        str += el.transcript + "\n", "");
  }


  private async transcribe(content: Content): Promise<void> {
    const params = {
      TranscriptionJobName: content.id,
      LanguageCode: 'en-US',
      MediaFormat: 'wav',
      Media: {
        MediaFileUri: content.uri
      },
      OutputBucketName: this.textBucketName,
    }

    await this.transcribeClient.send(
      new StartTranscriptionJobCommand(params)
    );
  }


  private convertToWavPassThrough(buffer: Buffer): Promise<PassThrough> {
    return new Promise((resolve, reject) => {
      const stream = this.bufferToStream(buffer);
      const pass = new PassThrough();

      ffmpeg(stream)
      .toFormat('wav')
      .on('error', () => {
        reject(new BadRequestException('Wrong format/corrupted file'));
      })
      .writeToStream(pass)

      setTimeout(() => resolve(pass), 500)
    })
  }


  private bufferToStream(binary: Buffer): Readable {
    const stream = new Readable({
      read() {
        this.push(binary);
        this.push(null);
      }
    });

    return stream;
  }
}