import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { TransactionEntity } from './transaction.entity';

export class TransactionsResponseEntity {
  @Expose()
  @ApiProperty()
  total: number;

  @Expose()
  @ApiProperty()
  limit: number;

  @Expose()
  @ApiProperty()
  skip: number;

  @Expose()
  @Type(() => TransactionEntity)
  @ApiProperty({ type: [TransactionEntity] })
  results: TransactionEntity[];
}
