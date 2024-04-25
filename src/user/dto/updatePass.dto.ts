import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdatePassDto {
  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MaxLength(6, {
    message: '密码最大位数为6位',
  })
  password: string;
  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式',
    },
  )
  email: string;
}
