import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Place } from './place.entity';

@Entity()
export class WorkingHour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({default: "Same"})
  day: string;

  @Column('time')
  start: string;

  @Column('time')
  end: string;

  @ManyToOne(() => Place, place => place.workingHours)
  place: Place;
}