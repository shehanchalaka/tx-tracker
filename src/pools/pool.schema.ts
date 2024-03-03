import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PoolDocument = HydratedDocument<Pool>;

@Schema()
export class Pool {
  @Prop({ index: true, lowercase: true })
  address: string;

  @Prop({ default: 0 })
  currentBlock: number;
}

export const PoolSchema = SchemaFactory.createForClass(Pool);
