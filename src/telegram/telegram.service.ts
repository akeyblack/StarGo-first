import { Injectable, forwardRef, Inject, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { TelegramUser } from './entities/telegram-user.entity';
import { Repository } from 'typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { TelegramState } from '../types/telegram-state.type';
import { ReservationsService } from '../reservations/reservation.service';

@Injectable()
export class TelegramService {
  constructor (
    @InjectRepository(TelegramUser)
    private readonly telegramUsersRepository: Repository<TelegramUser>,
    @InjectBot()
    private readonly telegramBot: Telegraf<Context>,
    @Inject(forwardRef(() => ReservationsService))
    private readonly reservationService: ReservationsService,
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

  async makeReservation(state: TelegramState, chatId: number): Promise<string> {
    const user = await this.telegramUsersRepository.findOneBy({ chatId });

    if(!user)
      throw new InternalServerErrorException("Make /start command");

    const {id} = await this.reservationService.createReservation({
      ...state,
    }, user)
    return id;
  }
}