import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { POLL_QUEUE } from './constants';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class SyncService {
  constructor(@InjectQueue(POLL_QUEUE) private pollQueue: Queue) {}

  @Cron('*/10 * * * * *')
  async run() {
    await this.pollQueue.add(
      'poll_job',
      {},
      { removeOnComplete: 10, removeOnFail: 10 },
    );

    return true;
  }
}
