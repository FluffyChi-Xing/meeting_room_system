import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BookingEntity } from '../booking/entities/booking.entity';
import { User } from '../user/entities/user';
import { StatisticDto } from './dto/statistic.dto';

@Injectable()
export class StatisticService {
  //依赖注入
  @InjectEntityManager()
  private entityManager: EntityManager;
  //用户预约计数接口
  async UserBookCount(count: StatisticDto) {
    try {
      const res = await this.entityManager
        .createQueryBuilder(BookingEntity, 'b')
        .select('u.id', 'userId')
        .addSelect('u.username', 'username')
        .leftJoin(User, 'u', 'b.userId = u.id')
        .addSelect('count(1)', 'bookingCount')
        .where('b.startTime between :time1 and :time2', {
          time1: count.startTime,
          time2: count.endTime,
        })
        .addGroupBy('b.user')
        .getRawMany();
      return {
        code: HttpStatus.OK,
        message: '查询成功',
        data: res,
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '错误',
        data: e,
      };
    }
  }
}
