import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //注册接口
  @Post('register')
  async create(@Body() registerDto: RegisterDto) {
    return await this.userService.register(registerDto);
  }
  @Get('captcha')
  async captcha(@Query('address') address: string) {
    return this.userService.captcha(address);
  }
}
