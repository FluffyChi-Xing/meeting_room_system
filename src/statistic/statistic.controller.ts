import { Body, Controller, Post } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { RequireLogin } from '../utils/custom.decorator';
import { StatisticDto } from './dto/statistic.dto';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}
  @Post('userBookCount')
  @RequireLogin()
  async getBookCount(@Body() count: StatisticDto) {
    return await this.statisticService.UserBookCount(count);
  }
}
