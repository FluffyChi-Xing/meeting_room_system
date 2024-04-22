import { IsNotEmpty } from 'class-validator';

export class CaptchaDto {
  @IsNotEmpty()
  address: string;
}
