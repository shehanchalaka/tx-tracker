import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { MAIN_QUEUE, POLL_QUEUE } from '../constants';
import { Job, Queue } from 'bullmq';
import { EtherscanService } from '../../etherscan/etherscan.service';
import { PoolsService } from '../../pools/pools.service';
import { Logger } from '@nestjs/common';

@Processor(POLL_QUEUE, {
  limiter: { max: 1, duration: 1000 }, // max 1 request per 1000 milliseconds
})
export class PollProcessor extends WorkerHost {
  private readonly logger = new Logger(PollProcessor.name);

  constructor(
    private etherscanService: EtherscanService,
    private poolsService: PoolsService,

    @InjectQueue(MAIN_QUEUE) private mainQueue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    this.logger.verbose(`Polling for new blocks ${new Date().getTime()}`);

    const contractaddress = job.data.contractaddress; // USDT address
    const address = job.data.address; // WETH-USDC Pool address

    const blockNumber = await this.etherscanService.getBlockNumber();

    const currentBlock = await this.poolsService.getCurrentBlock(address);

    if (blockNumber <= currentBlock) {
      this.logger.verbose('New blocks not found');
    }

    const MAX_CRAWL_LIMIT = 20_000;
    const blockDiff = Math.min(MAX_CRAWL_LIMIT - 1, blockNumber - currentBlock);
    const endBlock = currentBlock + blockDiff;

    const main_job = await this.mainQueue.add(
      'main_job',
      { contractaddress, address, startBlock: currentBlock, endBlock },
      { removeOnComplete: 10, removeOnFail: 10 },
    );

    this.logger.verbose(
      `${blockDiff} new blocks found. Job Id [${main_job.id}] added to queue`,
    );
  }
}
