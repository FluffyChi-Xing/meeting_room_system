import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyLogger } from './utils/MyLogger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new MyLogger()); //启用winston日志框架
  app.useGlobalPipes(new ValidationPipe()); //启用ValidationPipe进行校验
  app.enableCors(); //启动跨域访问
  const configServer = app.get(ConfigService);
  await app.listen(configServer.get('server_port'));
}
bootstrap();
