import { Controller } from '@nestjs/common';
import { BookingService } from './booking.service';
@Controller('booking')
export class BookingController {
  //注入booking service
  constructor(private readonly bookingService: BookingService) {}
}
