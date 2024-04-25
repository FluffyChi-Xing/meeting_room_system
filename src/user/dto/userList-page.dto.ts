import { IsNotEmpty } from 'class-validator';

export class UserListPageDto {
  @IsNotEmpty({
    message: '页面数量不可为空',
  })
  pageNo: number;
  @IsNotEmpty({
    message: '页面偏移数不可为空',
  })
  pageSize: number;
}
