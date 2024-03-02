import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { BullModule } from '@nestjs/bullmq';
import { MAIN_QUEUE } from './constants';
import { MainProcessor } from './processors/main.processor';
import { EtherscanModule } from '../etherscan/etherscan.module';
import { BinanceModule } from '../binance/binance.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: MAIN_QUEUE }),
    EtherscanModule,
    BinanceModule,
    TransactionsModule,
  ],
  providers: [SyncService, MainProcessor],
})
export class SyncModule {}
