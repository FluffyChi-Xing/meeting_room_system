import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BookingEntity } from './entities/booking.entity';
import { User } from '../user/entities/user';
import { MeetingRoom } from '../meeting-room/entities/meeting-room.entity';
import { BookingDto } from './dto/Booking.dto';
import { BookingSearchDto } from './dto/bookingSearch.dto';
import { BookRoomDto } from './dto/bookRoom.dto';
import { AccessDto } from './dto/access.dto';
@Injectable()
export class BookingService {
  @InjectRepository(BookingEntity)
  private bookEntity: Repository<BookingEntity>;
  private entityManager: EntityManager;
  //初始化booking列表
  async initData() {
    try {
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

      const result = await this.entityManager.save(BookingEntity, booking4);
      return {
        code: HttpStatus.OK,
        message: '初始化成功',
        data: result,
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '错误',
        data: e,
      };
    }
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
        const book = await this.bookEntity.find({
          where: {
            user: true,
          },
        });
        return {
          code: HttpStatus.OK,
          message: '查询成功',
          data: book,
        };
      }
      //如果状态不空不空
      if (search.status) {
        const book = await this.bookEntity.find({
          where: {
            status: search.status,
          },
        });
        return {
          code: HttpStatus.OK,
          message: '查询成功',
          data: book,
        };
      }
      //如果会议室id不空
      if (search.roomID) {
        const book = await this.bookEntity.find({
          where: {
            id: search.roomID,
          },
        });
        return {
          code: HttpStatus.OK,
          message: '查询成功',
          data: book,
        };
      }
      //如果四个参数都不空
      if (
        search.bookTime &&
        search.status &&
        search.username &&
        search.roomID
      ) {
        const book = await this.bookEntity.findOne({
          where: {
            id: search.roomID,
            status: search.status,
            user: true,
            startTime: search.bookTime,
          },
        });
        return {
          code: HttpStatus.OK,
          message: '查询成功',
          data: book,
        };
      }
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '查询错误',
        data: e,
      };
    }
  }
  //预约会议室接口(用户)
  async bookingRoom(add: BookRoomDto) {
    //查询用户预约的会议室是否已经在会议室预约表中
    //如果是返回错误，如果否，在预约表中插入
    try {
      //检查用户预定的会议室Id是否存在于预约表中，如果是且已经通过审核且起止时间重合则返回错误
      const result = await this.bookEntity.findOne({
        where: {
          id: add.roomId,
        },
      });
      if (
        result.startTime === add.startTime &&
        result.endTime === add.endTime
      ) {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: '该会议室这段时间已被预约',
        };
      }
      if (result && result.sign === 100) {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: '当前会议室已被预约',
        };
      } else {
        add.status = '审核中';
        //待改进
        add.startTime = new Date();
        add.endTime = new Date();
        const result = await this.bookEntity.insert(add);
        return {
          code: HttpStatus.OK,
          message: '预约成功,审核中',
          data: result,
        };
      }
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '错误',
        data: e,
      };
    }
  }
  //管理员通过用户预约
  async changeAccess(id: AccessDto) {
    try {
      const result = await this.bookEntity.update(
        {
          id: id.id,
        },
        {
          status: '审核通过',
          sign: 100,
        },
      );
      return {
        code: HttpStatus.OK,
        message: '更新成功',
        data: result,
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '错误',
        data: e,
      };
    }
  }
  //预约驳回
  async refuseAccess(id: AccessDto) {
    try {
      const result = await this.bookEntity.update(
        {
          id: id.id,
        },
        {
          status: '审批驳回',
          sign: -1,
        },
      );
      return {
        code: HttpStatus.OK,
        message: '更新成功',
        data: result,
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
