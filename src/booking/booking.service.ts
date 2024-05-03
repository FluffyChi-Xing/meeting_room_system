import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BookingEntity } from './entities/booking.entity';
import { User } from '../user/entities/user';
import { MeetingRoom } from '../meeting-room/entities/meeting-room.entity';
import { BookingDto } from './dto/Booking.dto';
import { BookingSearchDto } from './dto/bookingSearch.dto';
@Injectable()
export class BookingService {
  @InjectRepository(BookingEntity)
  private bookEntity: Repository<BookingEntity>;
  private entityManager: EntityManager;
  //初始化booking列表
  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1,
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 2,
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 3,
    });
    const room2 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 6,
    });

    const booking1 = new BookingEntity();
    booking1.room = room1;
    booking1.user = user1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(BookingEntity, booking1);

    const booking2 = new BookingEntity();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(BookingEntity, booking2);

    const booking3 = new BookingEntity();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(BookingEntity, booking3);

    const booking4 = new BookingEntity();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(BookingEntity, booking4);
  }
  //拉取预定信息
  async pullData(book: BookingDto) {
    if (book.pageNo < 1) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '页码不可小于一',
      };
    }
    const skipCount = (book.pageNo - 1) * book.pageNo;
    try {
      const [books, totalCount] = await this.bookEntity.findAndCount({
        skip: skipCount,
        take: book.pageSize,
      });
      return {
        code: HttpStatus.OK,
        message: '查询成功',
        data: books,
        count: totalCount,
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '查询错误',
        data: e,
      };
    }
  }
  //模糊查询预定记录
  async searchData(search: BookingSearchDto) {
    try {
      //如果预定时间不空
      if (search.bookTime) {
        const book = await this.bookEntity.find({
          where: {
            startTime: search.bookTime,
          },
        });
        return {
          code: HttpStatus.OK,
          message: '查询成功',
          data: book,
        };
      }
      //如果预约人不空
      if (search.username) {
      }
      //如果地点不空
      if (search.location) {
      }
      //如果会议室名不空
      if (search.roomName) {
      }
      //如果四个参数都不空
      if (
        search.bookTime &&
        search.location &&
        search.username &&
        search.roomName
      ) {
      }
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '查询错误',
        data: e,
      };
    }
  }
}
