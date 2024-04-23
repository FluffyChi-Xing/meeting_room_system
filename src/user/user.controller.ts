import { Controller, Post, Body, Get, Query, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { RefreshDto } from './dto/refresh.dto';

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
  @Post('login')
  async loginUser(@Body() userLogin: LoginUserDto) {
    const vo = await this.userService.userLogin(userLogin);
    return {
      code: HttpStatus.OK,
      data: vo,
    };
  }
  @Get('refresh')
  async refresh(@Body() refreshToken: RefreshDto) {
    return await this.userService.refresh(refreshToken);
  }
}
