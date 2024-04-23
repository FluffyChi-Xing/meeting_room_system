import { IsNotEmpty, MaxLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({
    message: '用户名不可为空',
  })
  username: string;
  @IsNotEmpty({
    message: '密码不可为空',
  })
  @MaxLength(6, {
    message: '密码的最大长度为6位',
  })
  password: string;
  @IsNotEmpty({
    message: '请选择您的身份',
  })
  isAdmin: string;
}
