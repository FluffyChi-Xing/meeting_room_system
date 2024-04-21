import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { RedisService } from '../redis/redis.service';
import { md5 } from '../utils/md5';

@Injectable()
export class UserService {
  private logger = new Logger();
  //注入 Repository<User>
  @InjectRepository(User)
  private useRepository: Repository<User>;
  //注入redis
  @Inject(RedisService)
  private redisService: RedisService;
  async register(register: RegisterDto) {
    //注册流程
    //先从redis中判断验证码
    const captcha = await this.redisService.get(`captcha_${register.email}`);
    //如果没查到，验证码已失效
    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }
    //验证码不正确
    if (register.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    //如果验证码，进入mysql查询用户
    const search = await this.useRepository.findOneBy({
      username: register.username,
    });
    //如果找到，抛出不需要注册响应
    if (search) {
      throw new HttpException('用户已注册', HttpStatus.BAD_REQUEST);
    }
    //注册新用户
    const newUser = new User();
    newUser.username = register.username;
    newUser.password = md5(register.password); //其中密码使用md5加密
    newUser.email = register.email;
    newUser.nickName = register.nickName;
    try {
      await this.useRepository.save(newUser);
      return {
        status: HttpStatus.OK,
        message: 'success register',
      };
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册错误';
    }
  }

  findAll() {
    return `This action returns all user`;
  }
}
