import { IsArray, IsISO8601, IsUUID } from "class-validator";

export class CreateEventDto {
  start: string;
  end: string;
  name: string;

  @IsISO8601()
  date: string;
  description: string;

  @IsArray()
  features: string[];

  @IsUUID()
  placeId: string;
}