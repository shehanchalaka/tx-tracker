import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransactionEntity } from './entities/transaction.entity';
import { ParseHashPipe } from 'src/common/pipes/parseHash.pipe';
import { TransactionsResponseEntity } from './entities/transactionsResponse.entity';
import { TransactionsQueryDto } from './dtos/transactionsQuery.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Get transactions' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of transactions',
    type: TransactionsResponseEntity,
  })
  @Get('/')
  async getTransactions(@Query() query: TransactionsQueryDto) {
    return await this.transactionsService.getTransactions(query);
  }

  @ApiOperation({ summary: 'Get transaction by hash' })
  @ApiResponse({
    status: 200,
    description: 'Returns a transaction by hash',
    type: TransactionEntity,
  })
  @Get('/:hash')
  async getTransactionByHash(@Param('hash', ParseHashPipe) hash: string) {
    return await this.transactionsService.getTransactionByHash(hash);
  }
}
