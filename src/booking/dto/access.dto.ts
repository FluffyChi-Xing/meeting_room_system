import { IsNotEmpty } from 'class-validator';

export class AccessDto {
  @IsNotEmpty({
    message: 'id不可为空',
  })
  id: number;
}
