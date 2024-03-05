import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SyncService } from './sync.service';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { MAIN_QUEUE, POLL_QUEUE } from './constants';
import { PollProcessor } from './processors/poll.processor';
import { MainProcessor } from './processors/main.processor';
import { EtherscanModule } from '../etherscan/etherscan.module';
import { BinanceModule } from '../binance/binance.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PoolsModule } from '../pools/pools.module';
import { Queue } from 'bullmq';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { SyncController } from './sync.controller';

@Module({
  imports: [
    BullModule.registerQueue({ name: POLL_QUEUE }, { name: MAIN_QUEUE }),
    EtherscanModule,
    BinanceModule,
    TransactionsModule,
    PoolsModule,
  ],
  providers: [SyncService, PollProcessor, MainProcessor],
  controllers: [SyncController],
})
export class SyncModule implements NestModule {
  constructor(
    @InjectQueue(POLL_QUEUE) private pollQueue: Queue,
    @InjectQueue(MAIN_QUEUE) private mainQueue: Queue,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/sync/queues');

    createBullBoard({
      queues: [
        new BullMQAdapter(this.pollQueue),
        new BullMQAdapter(this.mainQueue),
      ],
      serverAdapter,
    });

    consumer.apply(serverAdapter.getRouter()).forRoutes('sync/queues');
  }
}
