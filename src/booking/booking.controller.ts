import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { RequireLogin, RequirePermission } from '../utils/custom.decorator';
import { BookingDto } from './dto/Booking.dto';
import { BookingSearchDto } from './dto/bookingSearch.dto';
import { BookRoomDto } from './dto/bookRoom.dto';
import { AccessDto } from './dto/access.dto';
@Controller('booking')
export class BookingController {
  //注入booking service
  constructor(private readonly bookingService: BookingService) {}
  //初始化订阅表
  @Get('init')
  async initData() {
    return await this.bookingService.initData();
  }
  //拉取预订信息
  @Post('pull')
  @RequireLogin()
  async pullData(@Body() book: BookingDto) {
    return await this.bookingService.pullData(book);
  }
  //模糊查询预订信息
  //需要登录
  @Post('search')
  @RequireLogin()
  async searchData(@Body() search: BookingSearchDto) {
    await this.bookingService.searchData(search);
  }
  //用户预定会议室接口
  @Post('add')
  @RequireLogin()
  async addBooking(@Body() add: BookRoomDto) {
    return await this.bookingService.bookingRoom(add);
  }
  //管理员放行预约
  @Post('agree')
  @RequireLogin()
  @RequirePermission('ddd')
  async agreeBooking(@Body() id: AccessDto) {
    return await this.bookingService.changeAccess(id);
  }
  //管理员驳回预约
  @Post('refuse')
  @RequireLogin()
  @RequirePermission('ddd')
  async refuseBooking(@Body() id: AccessDto) {
    return await this.bookingService.refuseAccess(id);
  }
}
