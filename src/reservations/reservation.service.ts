import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatus } from "src/types/reservation-status.enum";
import { MailsService } from '../mails/mails.service';
import { TelegramService } from '../telegram/telegram.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PlacesService } from '../places/places.service';
import { TelegramUser } from '../telegram/entities/telegram-user.entity';

@Injectable()
export class ReservationsService {
  constructor (
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    private readonly mailsService: MailsService,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
    private readonly placesService: PlacesService,
  ) {}


  async createReservation(createReservationDto: CreateReservationDto, telegramUser: TelegramUser): Promise<Reservation> {
    const place = await this.placesService.getPlaceById(createReservationDto.placeId);

    return this.reservationsRepository.save({
      ...createReservationDto,
      place,
      status: ReservationStatus.IN_PROCESS,
      telegramUser,
    })
  }

  async getAllReservationsInProccess(): Promise<Reservation[]> {
    return this.reservationsRepository.findBy({ status: ReservationStatus.IN_PROCESS });
  }

  async changeReservationStatus(id: string, to: boolean): Promise<string> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: { 
        place: true,
        telegramUser: true
      } 
    });
    const newStatus = to ? ReservationStatus.APPROVED : ReservationStatus.DENIED;

    if(!reservation)
      throw new NotFoundException("Can't find reservation with that id")

    if(reservation.status != ReservationStatus.IN_PROCESS)
      throw new BadRequestException("Reservation already denied/approved");

    const updateResult = await this.reservationsRepository.update(
      { id }, 
      { status: newStatus }
    )

    if(!updateResult.affected)
      throw new InternalServerErrorException()

    try {
      await this.mailsService.sendEmail(
        reservation.email,
        `<p>Status of your ${reservation.place.name} reservation 
            updated to ${ReservationStatus[newStatus]}</p>`
      )
    } catch (err) {console.log(err)}

    try {
      await this.telegramService.sendMessage(
        reservation.telegramUser.chatId,
        `Status of your ${reservation.place.name} reservation updated to ${ReservationStatus[newStatus]}`
      )
    } catch (err) {console.log(err)}

    return ReservationStatus[newStatus];
  }
}