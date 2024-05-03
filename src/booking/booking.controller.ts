import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { RequireLogin } from '../utils/custom.decorator';
import { BookingDto } from './dto/Booking.dto';
import { BookingSearchDto } from './dto/bookingSearch.dto';
@Controller('booking')
export class BookingController {
  //注入booking service
  constructor(private readonly bookingService: BookingService) {}
  //初始化订阅表
  @Get('init')
  async initData() {
    await this.bookingService.initData();
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
}
