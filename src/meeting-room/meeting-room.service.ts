import { HttpStatus, Injectable } from '@nestjs/common';
import { MeetingRoom } from './entities/meeting-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoomPageDto } from './dto/meeting-room-page.dto';
import { CreateMeetingRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

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
}
