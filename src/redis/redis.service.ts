import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;
  async get(key: string) {
    return await this.redisClient.get(key);
  }
  async key(key: string) {
    return await this.redisClient.keys(key);
  }
  async range(key: string) {
    return await this.redisClient.lRange(key, 0, -1);
  }
  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);
    if (ttl) {
      //ttl 指定过期时间
      await this.redisClient.expire(key, ttl);
    }
  }
}
