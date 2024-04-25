import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateInfoDto {
  headPic: string;
  nickName: string;
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  username: string;
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
  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
  @IsNotEmpty({
    message: '电话号不可为空',
  })
  @MaxLength(11, {
    message: '不是正确的电话号格式',
  })
  phoneNumber: string;
  @IsNotEmpty({
    message: '密码不能为空',
  })
  password: string;
}
