import { IsNotEmpty } from 'class-validator';

export class BookingDto {
  @IsNotEmpty({
    message: '页面容量不可为空',
  })
  pageSize: number;
  @IsNotEmpty({
    message: '页码不可为空',
  })
  pageNo: number;
}
