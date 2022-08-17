import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ScraperService } from './scraper.service';

@Module({
  providers: [ScraperService],
  imports: [HttpModule.registerAsync({
    useFactory: () => ({
      timeout: 10000000,
      maxRedirects: 2,
      maxContentLength: 1000000000000
    })
  })],
  exports: [ScraperService]
})
export class ScraperModule {}