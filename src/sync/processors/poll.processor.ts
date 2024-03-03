import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { MAIN_QUEUE, POLL_QUEUE } from '../constants';
import { Job, Queue } from 'bullmq';
import { EtherscanService } from '../../etherscan/etherscan.service';
import { PoolsService } from '../../pools/pools.service';

@Processor(POLL_QUEUE, {
  limiter: { max: 1, duration: 1000 }, // max 1 request per 1000 milliseconds
})
export class PollProcessor extends WorkerHost {
  constructor(
    private etherscanService: EtherscanService,
    private poolsService: PoolsService,

    @InjectQueue(MAIN_QUEUE) private mainQueue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    console.log('[O] Polling...');

    const contractaddress = job.data.contractaddress; // USDT address
    const address = job.data.address; // WETH-USDC Pool address

    const blockNumber = await this.etherscanService.getBlockNumber();

    const currentBlock = await this.poolsService.getCurrentBlock(address);

    if (blockNumber <= currentBlock) {
      console.log('[X] New blocks not found');
    }

    const blockDiff = Math.min(19_999, blockNumber - currentBlock);
    const endBlock = currentBlock + blockDiff;

    console.log('[O] New blocks found');

    const mainJob = await this.mainQueue.add(
      'main_job',
      { contractaddress, address, startBlock: currentBlock, endBlock },
      { removeOnComplete: 10, removeOnFail: 10 },
    );

    console.log(`[O] Job ${mainJob.id} added to queue`);
  }
}
