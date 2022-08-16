import { Test } from '@nestjs/testing';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { Content } from '../contents/entities/content.entity';
import { MailsService } from '../mails/mails.service';


const filesPath=  "test/files/";
  const id = 'idididid';
  const fileUrl = "fileUrl";
  const content = {
    id,
    uri: fileUrl,
  } as Content;

  const mockS3Instance = {
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({Location: fileUrl})
    }),
    headObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue(true)
    }),
    waitFor: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue(true)
    }),
    getObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Body: '{"results":{"transcripts":[{"transcript":"abc"}]}}'
      })
    }),
  };

  const mockTranscribeClientInstance = {
    send: jest.fn().mockResolvedValue(true)
  };

  jest.mock('aws-sdk', () => {
    return { 
      S3: jest.fn(() => mockS3Instance)
    }
  });

  jest.mock('@aws-sdk/client-transcribe', () => {
    return {
      TranscribeClient: jest.fn(() => mockTranscribeClientInstance),
      StartTranscriptionJobCommand: jest.fn()
    }
  });

  const mockMailsService = {
    sendEmail: jest.fn().mockResolvedValue(true)
  }

  jest.setTimeout(20000);

  const mockConfigService = {
    get: jest.fn().mockReturnValue({
      fileBucketName: "test",
      textBucketName: "test",
      credentials: "test"
    })
  }


describe('FilesService', () => {
  let service: FilesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailsService,
          useValue: mockMailsService
        }
      ],
    })
    .compile();

    service = module.get<FilesService>(FilesService);
  });


  it('should be defined', () => {
    expect(FilesService).toBeDefined();
  });


  it('should check for corrupting, format and upload file to storage', async () => {
    const data = readFileSync(filesPath+"test.mp3")
    const file = {
      buffer: data,
      mimetype: 'audio/mpeg'
    }

    const result = service.uploadFile(file as Express.Multer.File, id);

    expect(await result).toEqual(fileUrl);
  });

  it('should check for corrupting and throw BadRequestException', async () => {
    const data = readFileSync(filesPath+"fake.mp3")
    const file = {
      buffer: data,
      mimetype: 'audio/mpeg'
    }

    const result = service.uploadFile(file as Express.Multer.File, id);
    
    await expect(result).rejects.toThrow(BadRequestException);
  });

  it('should check for corrupting, format and upload file to storage (video)', async () => {
    const data = readFileSync(filesPath+"test.mp4")
    const file = {
      buffer: data,
      mimetype: 'video/mp4'
    }

    const result = service.uploadFile(file as Express.Multer.File, id);

    expect(await result).toEqual(fileUrl);
  });

  it('should get text from file on storage by Content', async () => {
    const result = await service.getText(content);
    expect(result).toMatch("abc");
  });
});
