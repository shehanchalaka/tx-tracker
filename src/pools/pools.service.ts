import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pool, PoolDocument } from './pool.schema';
import { Model } from 'mongoose';
import { USDC_WETH_POOL_INFO } from '../constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PoolsService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectModel(Pool.name) private poolModel: Model<PoolDocument>,
  ) {}

  async onModuleInit() {
    const appStartBlock = this.configService.get('APP_START_BLOCK');
    const address = USDC_WETH_POOL_INFO.address;
    const currentBlock = !!appStartBlock
      ? appStartBlock
      : USDC_WETH_POOL_INFO.createdBlock;

    await this.poolModel.updateOne(
      { address },
      { $setOnInsert: { address, currentBlock } },
      { upsert: true },
    );
  }

  async getCurrentBlock(address: string): Promise<number> {
    const pool = await this.poolModel.findOne({
      address: address.toLowerCase(),
    });
    if (!pool) {
      throw new NotFoundException('Pool not found');
    }
    return pool.currentBlock;
  }

  async setCurrentBlock(
    address: string,
    blockNumber: number,
  ): Promise<boolean> {
    const result = await this.poolModel.updateOne(
      { address: address.toLowerCase() },
      { $max: { currentBlock: blockNumber } },
    );

    return result.modifiedCount > 0 && result.matchedCount > 0;
  }
}
