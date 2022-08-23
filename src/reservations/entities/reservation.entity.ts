import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReservationStatus } from '../../types/reservation-status.enum';
import { Place } from '../../places/entities/place.entity';
import { TelegramUser } from '../../telegram/entities/telegram-user.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Place)
  @JoinColumn()
  place: Place;

  @Column()
  status: ReservationStatus;

  @Column()
  day: string;

  @Column('time')
  time: string;

  @Column()
  guests: number;

  @Column()
  email: string;

  @ManyToOne(() => TelegramUser)
  @JoinColumn()
  telegramUser: TelegramUser;
}