import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { TelegramUser } from './entities/telegram-user.entity';
import { Repository } from 'typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  constructor (
    @InjectRepository(TelegramUser)
    private readonly telegramUsersRepository: Repository<TelegramUser>,
    @InjectBot()
    private readonly telegramBot: Telegraf<Context>,
  ) {}

  async sendMessage(chatId: number, message: string): Promise<number> {
    await this.telegramBot.telegram.sendMessage(chatId, message);
    return chatId;
  }

  async getTelegramUserById(id: string): Promise<TelegramUser> {
    return this.telegramUsersRepository.findOneBy({ id });
  }

  async createTelegramUser(chatId: number, username: string): Promise<TelegramUser> {
    return this.telegramUsersRepository.save({
      chatId,
      username,
      reservation: []
    });
  }
}