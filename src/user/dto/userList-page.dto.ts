import { IsNotEmpty } from 'class-validator';

export class UserListPageDto {
  @IsNotEmpty({
    message: '页面编号不可为空',
  })
  pageNo: number;
  @IsNotEmpty({
    message: '页面大小不可为空',
  })
  pageSize: number;
}
