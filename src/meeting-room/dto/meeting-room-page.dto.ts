import { IsNotEmpty } from 'class-validator';

export class MeetingRoomPageDto {
  @IsNotEmpty({
    message: '页码不能为空',
  })
  pageNo: number;
  @IsNotEmpty({
    message: '页面容量不能为空',
  })
  pageSize: number;
}
