import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MAIN_QUEUE } from '../constants';
import { Job } from 'bullmq';
import { EtherscanService } from '../../etherscan/etherscan.service';
import { BinanceService } from '../../binance/binance.service';
import { addMinutes, closestIndexTo, startOfMinute } from 'date-fns';
import { TransactionsService } from '../../transactions/transactions.service';
import BigNumber from 'bignumber.js';

export function pow10(n: number): BigNumber {
  return new BigNumber(10).pow(n);
}

@Processor(MAIN_QUEUE, {
  limiter: { max: 1, duration: 1000 }, // max 1 request per 1000 milliseconds
})
export class MainProcessor extends WorkerHost {
  constructor(
    private etherscanService: EtherscanService,
    private binanceService: BinanceService,
    private transactionsService: TransactionsService,
  ) {
    super();
  }

  async process(job: Job) {
    console.log('====== Started Processing ======');

    const contractaddress = job.data.contractaddress;
    const address = job.data.address;

    const startBlock = 18344771;
    const endBlock = startBlock + 100;

    const { total, events } =
      await this.etherscanService.getTokenTransferEvents({
        contractaddress,
        address,
        startblock: startBlock,
        endblock: endBlock,
      });

    if (total === 0) {
      // no transactions in the given block range
    }

    const startTime = addMinutes(parseInt(events[0].timeStamp) * 1000, -1);
    const endTime = addMinutes(parseInt(events[total - 1].timeStamp) * 1000, 1);

    const stTime = startOfMinute(startTime).getTime();
    const enTime = startOfMinute(endTime).getTime();

    const { klines } = await this.binanceService.getKlineData({
      symbol: 'ETHUSDT',
      interval: '5m',
      startTime: stTime,
      endTime: enTime,
      limit: 1000,
    });

    const prices = klines.map((kline) => ({
      timestamp: new Date(kline[0]),
      price: kline[1],
    }));

    const transactions = events.map((event) => {
      const timestamp = parseInt(event.timeStamp) * 1000;

      const index = closestIndexTo(
        timestamp,
        prices.map((t) => t.timestamp),
      );
      const result = prices[index];
      const ethPriceUsdt = result.price;

      const gasPriceBN = new BigNumber(event.gasPrice).div(pow10(18));
      const gasUsed = parseInt(event.gasUsed);
      const transactionFeeEthBN = gasPriceBN.multipliedBy(gasUsed);
      const transactionFeeUsdtBN =
        transactionFeeEthBN.multipliedBy(ethPriceUsdt);

      return {
        hash: event.hash,
        blockNumber: event.blockNumber,
        timestamp: event.timeStamp,
        gasPrice: event.gasPrice,
        gasUsed: event.gasUsed,
        transactionFee: transactionFeeUsdtBN.toNumber(),
      };
    });

    await this.transactionsService.bulkUpdateTransactions(transactions);

    console.log('Processing done!\n\n');
  }
}
