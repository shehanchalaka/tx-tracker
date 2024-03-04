import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop({ index: true, lowercase: true })
  hash: string;

  @Prop()
  blockNumber: number;

  @Prop({ index: true })
  timestamp: number;

  @Prop({ index: true, lowercase: true })
  pool: string;

  @Prop()
  gasPrice: string;

  @Prop()
  gasUsed: string;

  @Prop()
  transactionFeeEth: string;

  @Prop()
  transactionFee: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
