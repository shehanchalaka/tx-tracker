import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: TransactionsService;

  const mockTransaction = {
    hash: '0x125e0b641d4a4b08806bf52c0c6757648c9963bcda8681e4f996f09e00d4c2cc',
    blockNumber: 12376729,
    gasPrice: '64000000000',
    gasUsed: '5201405',
    timestamp: 1620250931,
    transactionFee: 1139.6453122208,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            getTransactions: jest.fn(() => ({})),
            getTransactionByHash: jest.fn(() => ({})),
            bulkUpdateTransactions: jest.fn(() => ({})),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTransactions', () => {
    it('should return a list of transactions', async () => {
      jest.spyOn(transactionsService, 'getTransactions').mockResolvedValue({
        total: 1,
        limit: 10,
        skip: 0,
        results: [mockTransaction],
      });
      const result = await controller.getTransactions({
        startTime: 1620250931,
        endTime: 1620250931,
        limit: 10,
        skip: 0,
      });
      expect(result.total).toEqual(1);
      expect(result.limit).toEqual(10);
      expect(result.skip).toEqual(0);
      expect(result.results).toHaveLength(1);
    });
  });

  describe('getTransactionByHash', () => {
    it('should return a transaction', async () => {
      jest
        .spyOn(transactionsService, 'getTransactionByHash')
        .mockResolvedValue(mockTransaction);
      const result = await controller.getTransactionByHash(
        mockTransaction.hash,
      );
      expect(result.hash).toEqual(mockTransaction.hash);
    });
  });
});
