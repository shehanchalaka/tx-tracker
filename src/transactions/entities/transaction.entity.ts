import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TransactionEntity {
  @Expose()
  @ApiProperty()
  hash: string;

  @Expose()
  @ApiProperty()
  blockNumber: number;

  @Expose()
  @ApiProperty()
  timestamp: number;

  @Expose()
  @ApiProperty()
  transactionFee: number;
}
