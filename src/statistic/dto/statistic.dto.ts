import { IsNotEmpty } from 'class-validator';

export class StatisticDto {
  @IsNotEmpty({
    message: '开始时间不可为空',
  })
  startTime: string;
  @IsNotEmpty({
    message: '截止时间不可为空',
  })
  endTime: string;
}
