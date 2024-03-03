import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pool, PoolDocument } from './pool.schema';
import { Model } from 'mongoose';

@Injectable()
export class PoolsService implements OnModuleInit {
  constructor(@InjectModel(Pool.name) private poolModel: Model<PoolDocument>) {}

  async onModuleInit() {
    const address = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';
    const currentBlock = 12376729;

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
