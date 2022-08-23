import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity() 
export class TelegramUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  chatId: number;
}