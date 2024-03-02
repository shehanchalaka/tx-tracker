import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MAIN_QUEUE } from './constants';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class SyncService {
  constructor(@InjectQueue(MAIN_QUEUE) private mainQueue: Queue) {}

  @Cron('*/10 * * * * *')
  async run() {
    const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const ETH_USDC_POOL_ADDRESS = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';

    await this.mainQueue.add(
      'main_job',
      { contractaddress: USDC_ADDRESS, address: ETH_USDC_POOL_ADDRESS },
      { removeOnComplete: 10, removeOnFail: 10 },
    );
  }
}
