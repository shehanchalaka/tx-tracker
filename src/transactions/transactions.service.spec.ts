import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionEntity } from './entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let model: Model<Transaction>;

  const mockTransaction = {
    _id: '65e40ab302d2a5f38fba0158',
    hash: '0x125e0b641d4a4b08806bf52c0c6757648c9963bcda8681e4f996f09e00d4c2cc',
    blockNumber: 12376729,
    gasPrice: '64000000000',
    gasUsed: '5201405',
    timestamp: 1620250931,
    transactionFee: 1139.6453122208,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    model = module.get<Model<Transaction>>(getModelToken(Transaction.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTransactionByHash', () => {
    it('should return a transaction when a valid hash is provided', async () => {
      model.findOne = jest.fn().mockImplementationOnce(() => ({
        toObject: jest.fn().mockResolvedValueOnce(mockTransaction),
      }));
      const result = await service.getTransactionByHash(mockTransaction.hash);
      expect(model.findOne).toHaveBeenCalledWith({
        hash: mockTransaction.hash,
      });
      expect(result).toBeInstanceOf(TransactionEntity);
      expect(result).toMatchObject(mockTransaction);
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);
      await expect(
        service.getTransactionByHash(mockTransaction.hash),
      ).rejects.toThrow(NotFoundException);
      expect(model.findOne).toHaveBeenCalledWith({
        hash: mockTransaction.hash,
      });
    });
  });
});
