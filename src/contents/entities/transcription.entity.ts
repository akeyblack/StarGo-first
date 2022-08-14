import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Content } from './content.entity';

@Entity()
export class Transcription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'text'})
  text: string;

  @OneToOne(() => Content, content => content.transcription)
  content: Content;
}