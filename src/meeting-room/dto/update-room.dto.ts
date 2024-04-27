import { PartialType } from '@nestjs/mapped-types';
import { CreateMeetingRoomDto } from './create-room.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateRoomDto extends PartialType(CreateMeetingRoomDto) {
  @IsNotEmpty({
    message: 'id不可为空',
  })
  id: number;
}
