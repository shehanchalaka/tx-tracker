import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MAIN_QUEUE } from '../constants';
import { Job } from 'bullmq';
import { EtherscanService } from '../../etherscan/etherscan.service';
import { BinanceService } from '../../binance/binance.service';
import {
  closestIndexTo,
  differenceInMinutes,
  roundToNearestMinutes,
} from 'date-fns';
import { TransactionsService } from '../../transactions/transactions.service';
import { PoolsService } from '../../pools/pools.service';
import BigNumber from 'bignumber.js';
import { Logger } from '@nestjs/common';

export function pow10(n: number): BigNumber {
  return new BigNumber(10).pow(n);
}

@Processor(MAIN_QUEUE, {
  limiter: { max: 1, duration: 1000 }, // max 1 request per 1000 milliseconds
})
export class MainProcessor extends WorkerHost {
  private readonly logger = new Logger(MainProcessor.name);

  constructor(
    private etherscanService: EtherscanService,
    private binanceService: BinanceService,
    private transactionsService: TransactionsService,
    private poolsService: PoolsService,
  ) {
    super();
  }

  async process(job: Job) {
    this.logger.verbose(`Started processing Job Id [${job.id}]`);

    const contractaddress = job.data.contractaddress; // Token address
    const address = job.data.address; // Pool address
    const startBlock = job.data.startBlock;
    let endBlock = job.data.endBlock;

    const { total, events, trimmed } =
      await this.etherscanService.getTokenTransferEvents({
        contractaddress,
        address,
        startblock: startBlock,
        endblock: endBlock,
      });

    if (total === 0) {
      // no transactions in the given block range
      this.logger.debug(
        `No transactions found in the block range ${startBlock} - ${endBlock}`,
      );
      await this.poolsService.setCurrentBlock(address, endBlock);
      return;
    }

    this.logger.verbose(`Fetched ${total} transactions`);

    const startTimeMillis = parseInt(events[0].timeStamp) * 1000;
    const endTimeMillis = parseInt(events[total - 1].timeStamp) * 1000;
    const startTime = roundToNearestMinutes(startTimeMillis, {
      nearestTo: 5,
      roundingMethod: 'floor',
    });
    const endTime = roundToNearestMinutes(endTimeMillis, {
      nearestTo: 5,
      roundingMethod: 'ceil',
    });

    const prices = await this.getPrices(startTime.getTime(), endTime.getTime());

    if (prices.length === 0) {
      this.logger.error(`Unable to find prices. Abroting processing`);
      return;
    }

    this.logger.verbose(`Fetched ${prices.length} klines`);

    const transactions = events.map((event) => {
      const timestamp = parseInt(event.timeStamp) * 1000;

      const index = closestIndexTo(
        timestamp,
        prices.map((t) => t.timestamp),
      );
      const result = prices[index];
      const ethPriceUsdt = result.price;

      if (Math.abs(differenceInMinutes(timestamp, result.timestamp)) >= 5) {
        console.log('errrr!! diff to muxh');
      }

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
        transactionFeeEth: transactionFeeEthBN.toString(),
        transactionFee: transactionFeeUsdtBN.toNumber(),
      };
    });

    await this.transactionsService.bulkUpdateTransactions(transactions);

    // if the ethersan results are trimmed save the last block number in the response instead
    if (trimmed) {
      endBlock = parseInt(events[total - 1].blockNumber);
    }

    await this.poolsService.setCurrentBlock(address, endBlock);

    this.logger.verbose(
      `Processing done till block number ${endBlock} Job Id [${job.id}]`,
    );
  }

  async getPrices(startTime: number, endTime: number) {
    const INTERVAL = 5; // 5 mins
    const LIMIT = 1000;
    const MILLIS = INTERVAL * (LIMIT - 1) * 60 * 1000;

    const results = [];

    let _startTime = startTime;

    while (_startTime < endTime) {
      const { klines } = await this.binanceService.getKlineData({
        symbol: 'ETHUSDT',
        interval: '5m',
        startTime: _startTime,
        endTime: Math.min(_startTime + MILLIS, endTime),
        limit: LIMIT,
      });
      results.push(...klines);
      _startTime += MILLIS;
    }

    const prices = results.map((kline) => ({
      timestamp: new Date(kline[0]),
      price: kline[1],
    }));

    return prices;
  }
}
