import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Address } from './address.entity';

@Entity()
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name: string;

  @Column()
  description?: string;

  @Column('simple-array')
  amenities?: string[];

  @Column()
  workingHour?: string;

  @Column()
  phone: string;

  @Column('simple-array')
  images: string[];

  @Column()
  rating?: number;

  @Column()
  lowestRated?: string;

  @Column()
  highestRated?: string;

  @Column()
  url: string;

  @OneToOne(() => Address, address => address.place, {
    cascade: true,
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn()
  address: Address;
}