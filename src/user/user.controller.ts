import { Controller, Post, Body, Get, Query, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { RefreshDto } from './dto/refresh.dto';
import {
  RequireLogin,
  RequirePermission,
  UserInfo,
} from '../utils/custom.decorator';
import { UpdatePassDto } from './dto/updatePass.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UserListPageDto } from './dto/userList-page.dto';
import { FuzzySearchDto } from './dto/FuzzySearch.dto';

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
    return vo;
  }
  @Post('refresh')
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
  //修改密码接口
  @Post('changePass')
  @RequireLogin()
  async changePass(
    @UserInfo('userId') userId: number,
    @Body() password: UpdatePassDto,
  ) {
    return await this.userService.changePass(userId, password);
  }
  //更新用户数据
  @Post('updateInfo')
  async updateInfo(
    @UserInfo('userId') userId: number,
    @Body() info: UpdateInfoDto,
  ) {
    return await this.userService.updateInfo(userId, info);
  }
  //查询所有用户
  //需要分页
  @Post('userList')
  @RequireLogin() //需要登录
  async getAllUser(@Body() page: UserListPageDto) {
    return await this.userService.getUserList(page);
  }
  //冻结用户权限
  //需要登录
  @Post('frozen')
  @RequireLogin()
  async frozenUser(@Body() id: number) {
    return await this.userService.frozen(id);
  }
  //判断是否登录
  @Get('isLogin')
  @RequireLogin()
  async checkToken() {
    return {
      code: HttpStatus.OK,
      message: '用户已登录',
      sign: true,
    };
  }
  //根据用户名、昵称或邮箱查询用户
  @Post('fuzzy')
  @RequireLogin()
  async FuzzySearch(@Body() params: FuzzySearchDto) {
    return await this.userService.fuzzySearch(params);
  }
}
