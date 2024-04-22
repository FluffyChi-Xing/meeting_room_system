import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyLogger } from './utils/MyLogger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new MyLogger()); //启用winston日志框架
  app.useGlobalPipes(new ValidationPipe()); //启用ValidationPipe进行校验
  app.enableCors(); //启动跨域访问
  await app.listen(3000);
}
bootstrap();
