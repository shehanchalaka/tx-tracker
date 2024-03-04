import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { POLL_QUEUE } from './constants';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { USDC_WETH_POOL_INFO } from '../constants';

@Injectable()
export class SyncService {
  constructor(@InjectQueue(POLL_QUEUE) private pollQueue: Queue) {}

  @Cron('*/10 * * * * *')
  async run() {
    const contractaddress = USDC_WETH_POOL_INFO.token0;
    const address = USDC_WETH_POOL_INFO.address;

    await this.pollQueue.add(
      'poll_job',
      { contractaddress, address },
      { removeOnComplete: 10, removeOnFail: 10 },
    );
  }
}
