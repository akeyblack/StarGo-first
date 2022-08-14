import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';
import { Transcription } from './transcription.entity';
import { ContentStatus } from '../../types/content-status.enum';

@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({unique: true})
  filename: string;

  @Column()
  type: string;

  @Column()
  mimetype: string;

  @Column('timestamp')
  date: Date;

  @Column()
  size: number;

  @Column()
  extension: string;

  @Column({type: "int"})
  statusCode: ContentStatus;

  @Column()                                  
  uri?: string;

  @OneToOne(() => Transcription, transcription => transcription.content, {
    cascade: true,
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn()
  transcription?: Transcription;
}