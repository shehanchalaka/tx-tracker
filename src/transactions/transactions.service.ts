import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './transaction.schema';
import { Model } from 'mongoose';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

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
