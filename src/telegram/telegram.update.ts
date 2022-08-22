import { Command, Ctx, Start, Update } from "nestjs-telegraf";
import { Context, Scenes } from 'telegraf';
import { TelegramService } from "./telegram.service";

@Update()
export class TelegramUpdate {
  constructor(
    private readonly telegramService: TelegramService,
  ) {}


  @Start()
  async start (@Ctx() ctx: Context) {
    try {
      await this.telegramService.createTelegramUser(ctx.chat.id, ctx.message.from.username);
    } catch {
      ctx.reply('Error occurs! Try to reload the bot');
    }
  }

  @Command('make')
  async makeReservation(@Ctx() ctx: Scenes.SceneContext) {
    ctx.scene.enter('makeReservation');
  }
}