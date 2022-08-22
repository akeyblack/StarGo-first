import { Action, Command, Context, On, Wizard, WizardStep } from "nestjs-telegraf";
import { Scenes } from "telegraf";
import { PlacesService } from '../../places/places.service';
import { Week } from '../../types/week.enum';

@Wizard('makeReservation')
export class MakeReservationScene {
  constructor(
    private readonly placesService: PlacesService,
  ) {
    this.state = {
      city: '',
      name: '',
      id: '',
      day: '',
      time: '',
      email: '',
      guests: 0,
    }
  }

  private state: {
    city: string,
    name: string,
    id: string,
    day: string,
    time: string,
    email: string,
    guests: number,
  }

  @Command('reset')
  async reset(@Context() ctx: Scenes.WizardContext) {
    ctx.reply('Reset');
    ctx.scene.leave();
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    ctx.reply('Enter your city');
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const text = ctx.message['text'];

    this.state.city = text;
    ctx.reply('Enter place name (or its part)');
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const text = ctx.message['text'];
    this.state.name = text;
    const places = await this.placesService.getPlacesByCityAndName(this.state.city, text);

    if(!places.length) {
      ctx.reply("Can't find any place with that combination, enter CITY again");
      ctx.wizard.selectStep(1);
      return;
    }

    const inlineKeyboard = places.map(el => {
      return [{ text: el.name, callback_data: `action:${el.id}` }]
    });

    ctx.reply('Choose your place', {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      }
    })
    ctx.wizard.next();
  }

  @Action(/action:.+/)
  @WizardStep(4)
  async step4(@Context() ctx: Scenes.WizardContext) {
    this.state.id = ctx.callbackQuery.data.split(':')[1];
    ctx.answerCbQuery();

    const inlineKeyboard = ["Today", "Tomorrow", "Day after tomorrow"].map((el, i) => {
      return [{ text: el, callback_data: `action:${new Date().getDay()+i}` }]
    });

    ctx.reply('Pick a day', {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      }
    });

    ctx.wizard.next();
  }

  @Action(/action:.+/)
  @WizardStep(5)
  async step5(@Context() ctx: Scenes.WizardContext) {
    this.state.day = Week[ctx.callbackQuery.data.split(':')[1]];
    ctx.answerCbQuery();

    ctx.reply('Pick a time (Enter in format, for example 13:00)')

    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(6)
  async step6(@Context() ctx: Scenes.WizardContext) {
    const text = ctx.message['text'];
    if(!(await this.placesService.isOpenedById(this.state.id, this.state.day, text)))  {
      ctx.reply("Place is closed in that time, enter another");
      ctx.wizard.selectStep(5);
      return;
    }

    this.state.time = text;
    
    ctx.reply('Number of guests?')

    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(7)
  async step7(@Context() ctx: Scenes.WizardContext) {
    this.state.guests = Number(ctx.message['text'])

    ctx.reply('Enter your email for notification (optional)')

    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(8)
  async step8(@Context() ctx: Scenes.WizardContext) {
    this.state.email = ctx.message['text'];

    ctx.reply(
      'Make a reservation with parameters?: \n' + JSON.stringify(this.state, null, '\t'), {
        reply_markup: {
          inline_keyboard: [[
            { text: "Yes", callback_data: "action:true" },
            { text: "No, reset", callback_data: "action:false" },
          ]]
        }
      } 
    );

    ctx.wizard.next();
  }

  @Action(/action:.+/)
  @WizardStep(9)
  async step9(@Context() ctx: Scenes.WizardContext) {
    const [, result] = ctx.callbackQuery.data.split(':');
    ctx.answerCbQuery();

    if(result==='true')
      ctx.reply('Done! Enter /make for new reservation')
    else
      ctx.reply('Enter /make for new reservation')

    ctx.scene.leave();
  }
}