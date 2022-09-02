import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TwitterApi } from "twitter-api-v2";

@Injectable()
export class TwitterService {
  constructor(
    private readonly configService: ConfigService
  ) {
    //this.client = new TwitterApi(configService.get('twitter'))
  }

  private client: TwitterApi;

  
  async createPost(): Promise<boolean> {
    return true;
  }


}