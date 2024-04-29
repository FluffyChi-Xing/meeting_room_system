import { HttpStatus, Injectable } from '@nestjs/common';
import { MeetingRoom } from './entities/meeting-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoomPageDto } from './dto/meeting-room-page.dto';
import { CreateMeetingRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SearchRoomDto } from './dto/search-room.dto';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private meetingRepository: Repository<MeetingRoom>;
  //获取所有的会议室
  //分页查询
  async getAllRoom(page: MeetingRoomPageDto) {
    if (page.pageNo < 1) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '页码最小为一',
      };
    }
    try {
      const skipCount = (page.pageNo - 1) * page.pageSize;
      const [rooms, totalCount] = await this.meetingRepository.findAndCount({
        skip: skipCount,
        take: page.pageSize,
      });
      return {
        code: HttpStatus.OK,
        message: '拉取成功',
        data: rooms,
        count: totalCount,
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '拉取失败',
        data: e,
      };
    }
  }
  //根据会议室id删除会议室
  async deleteOne(id: number) {
    try {
      const result = await this.meetingRepository.delete({
        id: id,
      });
      return {
        code: HttpStatus.OK,
        message: '删除成功',
        data: result,
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '删除错误',
        data: e,
      };
    }
  }
  //创建会议室
  async createRoom(room: CreateMeetingRoomDto) {
    //会议室名应该唯一
    try {
      const name = await this.meetingRepository.findOne({
        where: {
          name: room.name,
        },
      });
      if (name) {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: '会议室名不能重复',
        };
      }
      const result = await this.meetingRepository.insert(room);
      return {
        code: HttpStatus.OK,
        message: '插入成功',
        data: result,
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '操作失败',
        data: e,
      };
    }
  }
  //更新会议室
  async updateRoom(room: UpdateRoomDto) {
    try {
      const meetingRoom = await this.meetingRepository.findOne({
        where: {
          id: room.id,
        },
      });

      if (!meetingRoom) {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: '会议室不存在',
        };
      }

      meetingRoom.capacity = room.capacity;
      meetingRoom.location = room.location;
      meetingRoom.name = room.name;

      if (room.description) {
        meetingRoom.description = room.description;
      }
      if (room.equipment) {
        meetingRoom.equipment = room.equipment;
      }

      await this.meetingRepository.update(
        {
          id: meetingRoom.id,
        },
        meetingRoom,
      );
      return {
        code: HttpStatus.OK,
        message: '更新成功',
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '错误',
        data: e,
      };
    }
  }
  //模糊查询会议室
  async searchRoom(room: SearchRoomDto) {
    try {
      //如果name不空
      if (room.name) {
        const result = await this.meetingRepository.find({
          where: {
            name: room.name,
          },
        });
        return {
          code: HttpStatus.OK,
          message: '查询成功',
          data: result,
        };
      }
      //如果location不空
      if (room.location) {
        const result = await this.meetingRepository.find({
          where: {
            location: room.location,
          },
        });
        return {
          code: HttpStatus.OK,
          message: '查询成功',
          data: result,
        };
      }
      //如果capacity不空
      if (room.capacity) {
        const result = await this.meetingRepository.find({
          where: {
            capacity: room.capacity,
          },
        });
        return {
          code: HttpStatus.OK,
          message: '查询成功',
          data: result,
        };
      }
      //如果equipment不空
      if (room.equipment) {
        const result = await this.meetingRepository.find({
          where: {
            equipment: room.equipment,
          },
        });
        return {
          code: HttpStatus.OK,
          message: room.equipment,
          data: result,
        };
      }
      if (room.name || room.equipment || room.location || room.capacity) {
        const result = await this.meetingRepository.findOne({
          where: {
            location: room.location,
            name: room.name,
            equipment: room.equipment,
            capacity: room.capacity,
          },
        });
        return {
          code: HttpStatus.OK,
          message: '查询成功',
          data: result,
        };
      } else {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: '四个参数不可都为空',
        };
      }
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '查询失败',
        data: e,
      };
    }
  }
  //根据四个参数新增会议室
  async batchRoom(room: SearchRoomDto) {
    try {
      if (room.name && room.location && room.capacity && room.equipment) {
        const result = await this.meetingRepository.findOne({
          where: {
            name: room.name,
          },
        });
        //如果存在重名会议室则不可以新建
        if (result) {
          return {
            code: HttpStatus.BAD_REQUEST,
            message: '会议室不可重名',
          };
        }
        await this.meetingRepository.insert(result);
        return {
          code: HttpStatus.OK,
          message: '创建成功',
        };
      }
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '创建错误',
        data: e,
      };
    }
  }
}
