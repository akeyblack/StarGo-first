import { Body, Controller, Get, Param, Patch, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) {}

  @Get()
  async getAllReservationsInProccess(): Promise<Reservation[]> {
    return this.reservationsService.getAllReservationsInProccess();
  }

  @Patch(':id')
  async updateReservationStatus(@Param('id') id: string, @Body() body: { approve: string }): Promise<string> {
    if(body.approve === 'true' || body.approve === 'false')
      return this.reservationsService.changeReservationStatus(id, body.approve === 'true');
    throw new BadRequestException('body.approve must be a boolean');
  }

}
