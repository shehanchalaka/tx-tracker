import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { BullModule } from '@nestjs/bullmq';
import { MAIN_QUEUE, POLL_QUEUE } from './constants';
import { PollProcessor } from './processors/poll.processor';
import { MainProcessor } from './processors/main.processor';
import { EtherscanModule } from '../etherscan/etherscan.module';
import { BinanceModule } from '../binance/binance.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PoolsModule } from 'src/pools/pools.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: POLL_QUEUE }, { name: MAIN_QUEUE }),
    EtherscanModule,
    BinanceModule,
    TransactionsModule,
    PoolsModule,
  ],
  providers: [SyncService, PollProcessor, MainProcessor],
})
export class SyncModule {}
