import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { POLL_QUEUE } from './constants';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PoolsService } from '../pools/pools.service';
import { EtherscanService } from '../etherscan/etherscan.service';
import { USDC_WETH_POOL_INFO } from '../constants';
import { SyncStatusEntity } from './entities/syncStatus.entity';

@Injectable()
export class SyncService {
  constructor(
    @InjectQueue(POLL_QUEUE) private pollQueue: Queue,

    private poolsService: PoolsService,
    private etherscanService: EtherscanService,
  ) {}

  @Cron('*/10 * * * * *')
  async run() {
    await this.pollQueue.add(
      'poll_job',
      {},
      { removeOnComplete: 10, removeOnFail: 10 },
    );

    return true;
  }

  async getSyncStatus(): Promise<SyncStatusEntity> {
    const address = USDC_WETH_POOL_INFO.address; // USDC-WETH Pool address

    const blockNumber = await this.etherscanService.getBlockNumber();
    const currentBlock = await this.poolsService.getCurrentBlock(address);

    const blocksBehind = Math.max(blockNumber - currentBlock, 0);

    return {
      status: `${blocksBehind} blocks behind`,
      latestBlock: blockNumber,
      currentSyncBlock: currentBlock,
    };
  }
}
