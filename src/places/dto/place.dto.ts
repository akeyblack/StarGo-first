export class PlaceDto {
  name: string;
  description?: string;
  amenities?: string[];
  workingHours?: string[];
  phone: string;
  images: string[];
  rating?: number;
  lowestRated?: string;
  highestRated?: string;
  url: string;
  address: string;
}