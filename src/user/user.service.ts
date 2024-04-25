import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { RedisService } from '../redis/redis.service';
import { md5 } from '../utils/md5';
import { EmailService } from '../email/email.service';
import { Role } from './entities/role';
import { Permission } from './entities/permission';
import { LoginUserDto } from './dto/loginUser.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshDto } from './dto/refresh.dto';
import { UserInfoVo } from './vo/user-info.vo';
import { UpdatePassDto } from './dto/updatePass.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UserListPageDto } from "./dto/userList-page.dto";

@Injectable()
export class UserService {
  private logger = new Logger();
  //注入 Repository<User>
  @InjectRepository(User)
  private useRepository: Repository<User>;
  //注入 Repository<Role>
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;
  //注入 Repository<Permission>
  @InjectRepository(Permission)
  private perRepository: Repository<Permission>;
  //注入redis
  @Inject(RedisService)
  private redisService: RedisService;
  //注入nodemailer
  @Inject(EmailService)
  private emailService: EmailService;
  //注入jwtService
  @Inject(JwtService)
  private jwtService: JwtService;
  //注入 configService
  @Inject(ConfigService)
  private configService: ConfigService;
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
        message: '注册成功',
      };
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册错误';
    }
  }
  async captcha(address: string) {
    const code = Math.random().toString().slice(2, 8); //随机验证码
    await this.redisService.set(`captcha_${address}`, code, 5 * 60); //将验证码存入redis
    try {
      await this.emailService.sendMail({
        to: address,
        subject: '注册验证码',
        html: `<p>你的验证码是 ${code}</p><p>验证码的有效期是五分钟</p>`,
      });
      return {
        message: '发送成功',
        code: HttpStatus.OK,
      };
    } catch (e) {
      return {
        message: '错误',
        code: HttpStatus.BAD_REQUEST,
        data: e,
      };
    }
  }
  //数据库初始化批处理
  /*
  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.perRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.useRepository.save([user1, user2]);
  }
   */
  //登录接口
  async userLogin(loginUser: LoginUserDto) {
    let isAdmin: boolean;
    try {
      if (loginUser.isAdmin === 'true') {
        isAdmin = true;
      }
      if (loginUser.isAdmin === 'false') {
        isAdmin = false;
      }
      const user = await this.useRepository.findOne({
        where: {
          username: loginUser.username,
          isAdmin: isAdmin,
        },
        relations: ['roles', 'roles.permissions'],
      });
      if (!user) {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: '用户不存在',
        };
      }
      if (user.password !== md5(loginUser.password)) {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: '密码错误',
        };
      }
      const vo = new LoginUserVo();
      vo.userInfo = {
        id: user.id,
        username: user.username,
        nickName: user.nickName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        headPic: user.headPic,
        createTime: user.createTime.getTime(),
        isFrozen: user.isFrozen,
        isAdmin: user.isAdmin,
        roles: user.roles.map((item) => item.name),
        permissions: user.roles.reduce((arr, item) => {
          item.permissions.forEach((permission) => {
            if (arr.indexOf(permission) === -1) {
              arr.push(permission);
            }
          });
          return arr;
        }, []),
      };
      vo.accessToken = this.jwtService.sign(
        {
          userId: vo.userInfo.id,
          username: vo.userInfo.username,
          roles: vo.userInfo.roles,
          permissions: vo.userInfo.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      vo.refreshToken = this.jwtService.sign(
        {
          userId: vo.userInfo.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );
      return {
        code: HttpStatus.OK,
        message: '登陆成功',
        data: vo,
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        data: e,
        message: '登录失败',
      };
    }
  }
  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.useRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }
  async refresh(refresh: RefreshDto) {
    try {
      const data = this.jwtService.verify(refresh.refreshToken);
      let sign: boolean;
      if (refresh.isAdmin === 'true') {
        sign = true;
      }
      if (refresh.isAdmin === 'false') {
        sign = false;
      }
      const user = await this.findUserById(data.userId, sign);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );

      return {
        code: HttpStatus.OK,
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
        },
        message: '刷新成功',
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: 'token 已失效，请重新登录',
        data: e,
      };
    }
  }
  //用户数据查询服务
  async getUserInfo(userId: number) {
    const user = await this.useRepository.findOne({
      where: { id: userId },
    });
    const vo = new UserInfoVo();
    vo.id = user.id;
    vo.email = user.email;
    vo.nickName = user.nickName;
    vo.username = user.username;
    vo.headPic = user.headPic;
    vo.isFroze = user.isFrozen;
    vo.createDate = user.createTime;
    vo.phone = user.phoneNumber;
    if (!user) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '用户不存在',
      };
    }
    return {
      code: HttpStatus.OK,
      isLogin: true,
      data: vo,
    };
  }
  //修改密码服务
  async changePass(userId: number, password: UpdatePassDto) {
    //由于更新密码需要发送邮件验证码进行验证，因此首先检查redis
    const captcha = await this.redisService.get(`captcha_${password.email}`);
    if (!captcha) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '验证码不存在',
      };
    }
    if (password.captcha !== captcha) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '验证码错误',
      };
    }
    //否则修改密码
    const user = await this.useRepository.findOne({
      where: {
        id: userId,
      },
    });
    user.password = md5(password.password);
    try {
      await this.useRepository.save(user);
      return {
        code: HttpStatus.OK,
        message: '修改成功',
      };
    } catch (e) {
      this.logger.error(e, UserService);
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '修改错误',
      };
    }
  }
  //修改用户信息
  async updateInfo(userId: number, info: UpdateInfoDto) {
    //更新用户信息先检查redis 的验证码
    const captcha = await this.redisService.get(`captcha_${info.email}`);
    if (!captcha) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '验证码不存在',
      };
    }
    if (info.captcha !== captcha) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '验证码错误',
      };
    }
    const user = await this.useRepository.findOne({
      where: {
        id: userId,
      },
    });
    user.headPic = info.headPic;
    user.nickName = info.nickName;
    user.phoneNumber = info.phoneNumber;
    user.username = info.username;
    user.password = md5(info.password);
    try {
      await this.useRepository.save(user);
      return {
        code: HttpStatus.OK,
        message: '修改成功',
      };
    } catch (e) {
      this.logger.error(e, UserService);
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '操作错误',
        data: e,
      };
    }
  }
  //查询所有用户
  async getUserList(page: UserListPageDto) {
    try {
      //偏移查询
      const skipCount = (page.pageNo - 1) * page.pageSize;
      const [users, totalCount] = await this.useRepository.findAndCount({
        skip: skipCount,
        take: page.pageSize,
      });
      return {
        code: HttpStatus.OK,
        message: '查询成功',
        data: {
          list: users,
          count: totalCount,
        },
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '查询错误',
        data: e,
      };
    }
  }
  //冻结用户权限
  async frozen(id: number) {
    const user = await this.useRepository.findOne({
      where: {
        id: id,
      },
    });
    user.isFrozen = true;
    try {
      await this.useRepository.save(user);
      return {
        code: HttpStatus.OK,
        message: `成功冻结了用户 ${id}`,
      };
    } catch (e) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '冻结失败',
      };
    }
  }
}
