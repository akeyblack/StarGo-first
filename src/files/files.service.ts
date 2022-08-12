import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { S3 } from "aws-sdk";
import { Readable } from "stream";

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService
  ) {
    this.s3 = new S3(this.configService.get('awsBucket'))
    this.bucketName = this.configService.get('awsBucket').name;
  }

  private s3: S3;
  private bucketName: string;

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: String(key),
      Body: file.buffer,
      ContentType: file.mimetype,
    }
    const result = await this.s3.upload(params, (err: Error) => {
      if(err)
        throw new BadGatewayException();
    }).promise();

    return result.Location;
  }


  async downloadFile(key: string): Promise<Readable> {
    const params = {
      Bucket: this.bucketName,
      Key: String(id)
    }

    return this.s3.getObject(params).createReadStream()
  }
}