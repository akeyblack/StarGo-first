import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Place } from '../../places/entities/place.entity';

@Entity()
export class PlaceEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('time')
  start: string;

  @Column('time')
  end: string;

  @Column('date')
  date: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('simple-array')
  features: string[];
  
  @Column('int')
  guests: number;

  @ManyToOne(() => Place)
  place: Place;
}