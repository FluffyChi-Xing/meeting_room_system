import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const client = createClient({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        });
        try {
          await client.connect();
          console.log('连接成功');
          return client;
        } catch (e) {
          console.log('连接失败', e);
        }
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
