import { Test, TestingModule } from '@nestjs/testing';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';
import { FileValidationPipe } from '../pipes/file-validation.pipe';
import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

describe('ContentsController', () => {
  let controller: ContentsController;
  const pipe = new FileValidationPipe;

  const data = {} as ArgumentMetadata;

  const mockContentsService = {
    uploadFile: jest.fn().mockResolvedValue("id")
  };

  const mockFile = {
    originalname: "abc.mp3",
    mimetype: "audio/mpeg",
    size: 1232,
  } as Express.Multer.File;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentsController],
      providers: [
        {
          provide: ContentsService,
          useValue: mockContentsService
        }
      ]
    }).compile();

    controller = module.get<ContentsController>(ContentsController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should validate in pipe', async () => {
    expect(
      await pipe.transform(mockFile, data)
    ).toEqual({
      ...mockFile,
      type: 'audio',
      extension: 'mp3'
    })
  })

  it('should validate in pipe (too big)', async () => {
    expect(
      pipe.transform({...mockFile, size: 1000000000}, data)
    ).rejects.toThrow(new BadRequestException("Audio files must be up to 25mb in size"));
  })

  it('should validate in pipe (fake file)', async () => {
    expect(
      pipe.transform({}, data)
    ).rejects.toThrow(BadRequestException);
  })
});