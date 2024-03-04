import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class TransactionsQueryDto {
  @ApiProperty({
    required: true,
    description: 'Start timestamp in seconds',
    default: 1697240003,
  })
  @IsNumber()
  @IsPositive()
  readonly startTime: number;

  @ApiProperty({
    required: true,
    description: 'End timestamp in seconds',
    default: 1697240423,
  })
  @IsNumber()
  @IsPositive()
  readonly endTime: number;

  @ApiProperty({ required: false, description: 'Default limit is set to 10' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(1000)
  readonly limit?: number = 10;

  @ApiProperty({ required: false, description: 'Default skip is set to 0' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  readonly skip?: number = 0;
}
