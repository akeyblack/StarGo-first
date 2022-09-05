import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { TwitterApi, TwitterApiReadWrite } from "twitter-api-v2";

@Injectable()
export class TwitterService {
  constructor(
    private readonly configService: ConfigService
  ) {
    this.client = new TwitterApi(configService.get('twitter'));
    this.rwClient = this.client.readWrite;
  }

  private client: TwitterApi;
  private rwClient: TwitterApiReadWrite;

  
  async createPost(text: string, img: string): Promise<boolean> {
    try {
      const id: string = await this.rwClient.v2.post(img);
      await this.rwClient.v2.tweet(text, {media: {media_ids: [id]}});
      this.rwClient.v2.post
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException("Problems with tweeting")
    }

    return true;
  }


}