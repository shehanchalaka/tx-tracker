import { Test, TestingModule } from '@nestjs/testing';
import { PoolsService } from './pools.service';
import { Pool } from './pool.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('PoolsService', () => {
  let service: PoolsService;
  let model: Model<Pool>;

  const mockPool = {
    _id: '65e40aaf02d2a5f38fba0154',
    address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    currentBlock: 19355558,
    __v: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoolsService,
        ConfigService,
        {
          provide: getModelToken(Pool.name),
          useValue: {
            findOne: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PoolsService>(PoolsService);
    model = module.get<Model<Pool>>(getModelToken(Pool.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentBlock', () => {
    it('should find and return the current block', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(mockPool);
      const result = await service.getCurrentBlock(mockPool.address);
      expect(model.findOne).toHaveBeenCalledWith({ address: mockPool.address });
      expect(result).toEqual(mockPool.currentBlock);
    });

    it('should throw NotFoundException if pool is not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);
      await expect(service.getCurrentBlock(mockPool.address)).rejects.toThrow(
        NotFoundException,
      );
      expect(model.findOne).toHaveBeenCalledWith({ address: mockPool.address });
    });
  });

  describe('setCurrentBlock', () => {
    it('should update the current block and return true', async () => {
      const blockNumber = 19355568;
      const mockResponse = {
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      };
      jest.spyOn(model, 'updateOne').mockResolvedValue(mockResponse);
      const result = await service.setCurrentBlock(
        mockPool.address,
        blockNumber,
      );
      expect(model.updateOne).toHaveBeenCalledWith(
        { address: mockPool.address },
        { $max: { currentBlock: blockNumber } },
      );
      expect(result).toEqual(true);
    });

    it('should return false if block number is less than current block', async () => {
      const blockNumber = 18355568;
      const mockResponse = {
        acknowledged: true,
        modifiedCount: 0,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      };
      jest.spyOn(model, 'updateOne').mockResolvedValue(mockResponse);
      const result = await service.setCurrentBlock(
        mockPool.address,
        blockNumber,
      );
      expect(model.updateOne).toHaveBeenCalledWith(
        { address: mockPool.address },
        { $max: { currentBlock: blockNumber } },
      );
      expect(result).toEqual(false);
    });
  });

  it('should return false if incorrect pool address is sent', async () => {
    const blockNumber = 19355568;
    const mockResponse = {
      acknowledged: true,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 0,
    };
    jest.spyOn(model, 'updateOne').mockResolvedValue(mockResponse);
    const result = await service.setCurrentBlock(mockPool.address, blockNumber);
    expect(model.updateOne).toHaveBeenCalledWith(
      { address: mockPool.address },
      { $max: { currentBlock: blockNumber } },
    );
    expect(result).toEqual(false);
  });
});
