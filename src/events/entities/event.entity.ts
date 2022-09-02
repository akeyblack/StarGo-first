import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class PlaceEvent {
  @PrimaryColumn('uuid')
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
  
  @Column('simple-array')
  guests: string[];
}