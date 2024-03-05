import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SyncModule } from './sync/sync.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EtherscanModule } from './etherscan/etherscan.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BinanceModule } from './binance/binance.module';
import { TransactionsModule } from './transactions/transactions.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PoolsModule } from './pools/pools.module';
import * as Joi from '@hapi/joi';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URI: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.string().required(),
        ETHERSCAN_API_KEY: Joi.string().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('DB_URI'),
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 10,
      }),
      inject: [ConfigService],
    }),
    SyncModule,
    EtherscanModule,
    BinanceModule,
    TransactionsModule,
    PoolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
