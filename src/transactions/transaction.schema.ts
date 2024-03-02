import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop({ index: true })
  hash: string;

  @Prop()
  blockNumber: number;

  @Prop()
  timestamp: number;

  @Prop()
  gasPrice: string;

  @Prop()
  gasUsed: string;

  @Prop()
  transactionFee: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
