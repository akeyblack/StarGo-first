import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Address } from './address.entity';
import { WorkingHour } from "./working-hour.entity";

@Entity()
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description?: string;

  @Column()
  amenities?: string;

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

  @OneToMany(() => WorkingHour, whours => whours.place, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  workingHours: WorkingHour[];
}