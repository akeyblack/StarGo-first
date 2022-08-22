import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity() 
export class TelegramUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  chatId: number;

  @OneToMany(() => Reservation, reservations => reservations.telegramUser, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  reservations: Reservation[];
}