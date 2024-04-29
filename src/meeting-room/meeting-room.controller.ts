import { Controller, Post, Body, Query } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { RequireLogin } from '../utils/custom.decorator';
import { MeetingRoomPageDto } from './dto/meeting-room-page.dto';
import { CreateMeetingRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SearchRoomDto } from './dto/search-room.dto';

@Controller('meeting')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}
  //获取会议室列表
  //需要登录
  //分页查询
  @Post('getAll')
  @RequireLogin()
  async getAllRoom(@Body() page: MeetingRoomPageDto) {
    return await this.meetingRoomService.getAllRoom(page);
  }
  //通过会议室id删除会议室
  //需要登录
  @Post('deleteOne')
  @RequireLogin()
  async create(@Query('id') id: number) {
    return await this.meetingRoomService.deleteOne(id);
  }
  //创建会议室
  //需要登录
  @Post('create')
  @RequireLogin()
  async createRoom(@Body() room: CreateMeetingRoomDto) {
    return await this.meetingRoomService.createRoom(room);
  }
  //更新会议室
  //需要登录
  @Post('update')
  @RequireLogin()
  async updateRoom(@Body() update: UpdateRoomDto) {
    return await this.meetingRoomService.updateRoom(update);
  }
  //模糊搜索会议室
  @Post('search')
  @RequireLogin()
  async searchRoom(@Body() room: SearchRoomDto) {
    return await this.meetingRoomService.searchRoom(room);
  }
  //根据四个参数创建会议室
  @Post('batchRoom')
  @RequireLogin()
  async batchRoom(room: SearchRoomDto) {
    return await this.meetingRoomService.batchRoom(room);
  }
}
