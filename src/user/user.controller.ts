import { Controller, Post, Body, Get, Query, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequireLogin, RequirePermission, UserInfo } from "../utils/custom.decorator";

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
      message: '登陆成功',
      data: vo,
    };
  }
  @Get('refresh')
  async refresh(@Body() refreshToken: RefreshDto) {
    return await this.userService.refresh(refreshToken);
  }
  //测试 login-guard
  @Get('guard')
  //@SetMetadata('require-login', true) //true的时候启动校验
  //@SetMetadata('require-permission', ['ddd']) //目前api-fox中的这个用户不支持ddd权限，所以请求不能通过
  //自定义装饰器
  @RequireLogin()
  @RequirePermission('ddd')
  testGuard() {
    return {
      code: HttpStatus.OK,
      message: 'Testing the guard',
    };
  }
  //查询用户信息接口
  @Get('info')
  async getInfo(@UserInfo('userId') userId: number) {
    return await this.userService.getUserInfo(userId);
  }
}
