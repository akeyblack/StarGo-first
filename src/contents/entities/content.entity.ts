import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  type: string;

  @Column()
  subtype: string;

  @Column('timestamp')
  date: Date;

  @Column()
  size: number;

  @Column()
  extension: string;
}