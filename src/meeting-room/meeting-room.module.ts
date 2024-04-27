import { Module } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { MeetingRoomController } from './meeting-room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';

@Module({
  controllers: [MeetingRoomController],
  providers: [MeetingRoomService],
  imports: [TypeOrmModule.forFeature([MeetingRoom])],
})
export class MeetingRoomModule {}
