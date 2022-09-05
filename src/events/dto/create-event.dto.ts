import { IsArray, IsISO8601, IsNotEmpty, IsUUID } from "class-validator";

export class CreateEventDto {
  @IsNotEmpty()
  start: string;

  @IsNotEmpty()
  end: string;

  @IsNotEmpty()
  name: string;

  @IsISO8601()
  date: string;

  @IsNotEmpty()
  description: string;

  @IsArray()
  features: string[];

  @IsUUID()
  placeId: string;
}