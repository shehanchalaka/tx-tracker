import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SyncStatusEntity {
  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  latestBlock: number;

  @Expose()
  @ApiProperty()
  currentSyncBlock: number;
}
