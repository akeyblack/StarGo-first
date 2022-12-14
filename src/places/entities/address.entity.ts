import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Place } from './place.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  city: string;

  @Column({default: ""})
  other: string;

  @OneToOne(() => Place, place => place.address)
  place: Place;
}