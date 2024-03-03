import { Module } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Pool, PoolSchema } from './pool.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pool.name, schema: PoolSchema }]),
  ],
  providers: [PoolsService],
  exports: [PoolsService],
})
export class PoolsModule {}
