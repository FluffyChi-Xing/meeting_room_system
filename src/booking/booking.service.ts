import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from './entities/booking.entity';
@Injectable()
export class BookingService {
  @InjectRepository(BookingEntity)
  private bookEntity: Repository<BookingEntity>;
}
