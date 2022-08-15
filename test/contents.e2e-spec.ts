/*import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ContentsModule } from '../src/contents/contents.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '../src/contents/entities/content.entity';
import { FilesService } from '../src/files/files.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from './config';
import { Repository } from 'typeorm';

describe('ContentsController (e2e)', () => {
  let app: INestApplication;
  let contentRepository: Repository<Content>;
  
  const mockFilesService = {
    uploadFile: jest.fn().mockResolvedValue("url")
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [config],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) =>
            configService.get('database'),
        }),
        TypeOrmModule.forFeature([Content]),
        ContentsModule,
      ],
    })
    .overrideProvider(FilesService).useValue(mockFilesService)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    contentRepository = moduleFixture.get('ContentRepository');
    await contentRepository.query('DELETE from content');
  });


  it('/contents/upload (POST) with fake buffer', () => {
    return request(app.getHttpServer())
      .post('/contents/upload')
      .attach('file', './test/files/fake.mp3')
      .expect(201)
  });

  it('/contents/upload (POST) without mimetype', () => {
    return request(app.getHttpServer())
      .post('/contents/upload')
      .attach('file', './test/files/test')
      .expect(400)
  });

  it('/contents/upload (POST) .mov', () => {
    return request(app.getHttpServer())
      .post('/contents/upload')
      .attach('file', './test/files/test.mov')
      .expect(201)
  });

  it('/contents/upload (POST) .mp3', () => {
    return request(app.getHttpServer())
      .post('/contents/upload')
      .attach('file', './test/files/test.mp3')
      .expect(201)
  });

  it('/contents/upload (POST) .mp4', () => {
    return request(app.getHttpServer())
      .post('/contents/upload')
      .attach('file', './test/files/test.mp4')
      .expect(201)
  });

  it('/contents/upload (POST) with wrong mimetype', () => {
    return request(app.getHttpServer())
      .post('/contents/upload')
      .attach('file', './test/files/test.png')
      .expect(400)
  });
});
*/