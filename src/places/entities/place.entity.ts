import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Address } from './address.entity';

@Entity()
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description?: string;

  @Column('simple-array')
  amenities?: string[];

  @Column({default: ""})
  workingHour?: string;

  @Column({default: ""})
  phone?: string;

  @Column('simple-array')
  images?: string[];

  @Column({default: 0})
  rating?: number;

  @Column('text')
  lowestRated?: string;

  @Column('text')
  highestRated?: string;

  @Column({unique: true})
  url: string;

  @OneToOne(() => Address, address => address.place, {
    cascade: true,
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn()
  address: Address;
}