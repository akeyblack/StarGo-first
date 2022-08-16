import { Test, TestingModule } from '@nestjs/testing';
import { ContentsService } from './contents.service';
import { FilesService } from '../files/files.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { Transcription } from './entities/transcription.entity';
import { config } from '../config';
import { FileType } from '../types/file.type';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ContentStatus } from '../types/content-status.enum';

describe('ContentsService', () => {
  let module: TestingModule;
  let contentsService: ContentsService;

  let contentsRepository: Repository<Content>

  const mockFilesService = {
    uploadFile: jest.fn().mockResolvedValue("url"),
    getText: jest.fn().mockResolvedValue("abc")
  };

  const mockFile = {
    originalname: "abc.mp3",
    type: "audio",
    mimetype: "audio/mpeg",
    size: 1232,
    extension: "mp3",
  } as FileType;

  const mockFile2 = {
    ...mockFile,
    originalname: "test2.mp3"
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        ContentsService,
        {
          provide: FilesService,
          useValue: mockFilesService
        }
      ],
      imports: [
        TypeOrmModule.forRoot(config().databaseTest as TypeOrmModuleOptions),
        TypeOrmModule.forFeature([Content, Transcription])
      ],
    }).compile();

    contentsService = module.get<ContentsService>(ContentsService);

    contentsRepository = module.get('ContentRepository');

    await contentsRepository.delete({});
  });

  afterAll(async () => {
    module.close();
  });


  it('should be defined', () => {
    expect(contentsService).toBeDefined();
  });


  it('should upload two files with same names', async () => {
    expect(
      (await contentsService.uploadFile(mockFile)).length
    ).toMatch(mockFile.filename);

    expect(
      contentsService.uploadFile(mockFile)
    ).rejects.toThrow(BadRequestException)
  });


  it('should get transcription by filename (Not Found)', async () => {
    expect(
      contentsService.getTextByName(mockFile2.originalname)
    ).rejects.toThrow(NotFoundException)
  });


  it('should get transcription by filename', async () => {
    expect(
      (await contentsService.uploadFile(mockFile2)).length
    ).toMatch(mockFile2.filename);

    expect(
      (await contentsRepository.findOneBy({filename: mockFile2.originalname})).statusCode
    ).toBe(ContentStatus.NOT_TRANSCRIBED)

    expect(
      await contentsService.getTextByName(mockFile2.originalname)
    ).toMatch("abc");

    expect(
      (await contentsRepository.findOneBy({filename: mockFile2.originalname})).statusCode
    ).toBe(ContentStatus.TRANSCRIBED)
  });
});