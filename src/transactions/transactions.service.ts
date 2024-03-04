import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './transaction.schema';
import { Model } from 'mongoose';
import { TransactionEntity } from './entities/transaction.entity';
import { plainToInstance } from 'class-transformer';
import { TransactionsResponseEntity } from './entities/transactionsResponse.entity';
import { TransactionsQueryDto } from './dtos/transactionsQuery.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async getTransactions(
    query: TransactionsQueryDto,
  ): Promise<TransactionsResponseEntity> {
    const startTime = query.startTime;
    const endTime = query.endTime;

    if (!startTime || !endTime) {
      throw new BadRequestException('startTime and endTime is required');
    }

    const limit = Math.min(query.limit ?? 10, 1000);
    const skip = query.skip ?? 0;

    const [txs] = await this.transactionModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime, $lte: endTime },
        },
      },
      {
        $facet: {
          results: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'amount' }],
        },
      },
      {
        $project: {
          results: 1,
          total: { $ifNull: [{ $first: '$total.amount' }, 0] },
        },
      },
    ]);

    const plain = {
      total: txs.total,
      limit,
      skip,
      results: txs.results,
    };

    return plainToInstance(TransactionsResponseEntity, plain);
  }

  async getTransactionByHash(hash: string): Promise<TransactionEntity> {
    const tx = await this.transactionModel.findOne({ hash });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    return plainToInstance(TransactionEntity, tx.toObject());
  }

  async bulkUpdateTransactions(transactions: any[]) {
    await this.transactionModel.bulkWrite(
      transactions.map((tx) => ({
        updateOne: {
          filter: { hash: tx.hash },
          update: {
            $set: {
              hash: tx.hash,
              blockNumber: tx.blockNumber,
              timestamp: tx.timestamp,
              gasPrice: tx.gasPrice,
              gasUsed: tx.gasUsed,
              transactionFee: tx.transactionFee,
            },
          },
          upsert: true,
        },
      })),
    );

    console.log('bulk updating transactions');
  }
}
