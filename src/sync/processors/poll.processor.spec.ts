import { Test, TestingModule } from '@nestjs/testing';
import { PollProcessor } from './poll.processor';
import { EtherscanService } from '../../etherscan/etherscan.service';
import { PoolsService } from '../../pools/pools.service';
import { getQueueToken } from '@nestjs/bullmq';
import { MAIN_QUEUE } from '../constants';
import { Queue } from 'bullmq';

describe('PollProcessor', () => {
  let service: PollProcessor;
  let mainQueue: Queue;
  let etherscanService: EtherscanService;
  let poolsService: PoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollProcessor,
        {
          provide: getQueueToken(MAIN_QUEUE),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: EtherscanService,
          useValue: {
            getBlockNumber: jest.fn(),
          },
        },
        {
          provide: PoolsService,
          useValue: {
            getCurrentBlock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PollProcessor>(PollProcessor);
    mainQueue = module.get<Queue>(getQueueToken(MAIN_QUEUE));
    etherscanService = module.get<EtherscanService>(EtherscanService);
    poolsService = module.get<PoolsService>(PoolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('process', () => {
    it('should properly process a poll job', async () => {
      jest
        .spyOn(etherscanService, 'getBlockNumber')
        .mockResolvedValue(18359771);
      jest.spyOn(poolsService, 'getCurrentBlock').mockResolvedValue(18359770);
      jest.spyOn(mainQueue, 'add').mockResolvedValue({ id: 1 } as any);

      const job = {
        data: {},
      };

      const result = await service.process(job as any);

      expect(etherscanService.getBlockNumber).toHaveBeenCalledTimes(1);
      expect(poolsService.getCurrentBlock).toHaveBeenCalledTimes(1);
      expect(mainQueue.add).toHaveBeenCalledTimes(1);
      expect(result.status).toEqual(1);
    });

    it('should not add a job when block number <= current block', async () => {
      jest
        .spyOn(etherscanService, 'getBlockNumber')
        .mockResolvedValue(18359771);
      jest.spyOn(poolsService, 'getCurrentBlock').mockResolvedValue(18359771);
      jest.spyOn(mainQueue, 'add').mockResolvedValue({ id: 1 } as any);

      const job = {
        data: {},
      };

      const result = await service.process(job as any);

      expect(etherscanService.getBlockNumber).toHaveBeenCalledTimes(1);
      expect(poolsService.getCurrentBlock).toHaveBeenCalledTimes(1);
      expect(mainQueue.add).toHaveBeenCalledTimes(0);
      expect(result.status).toEqual(-1);
    });
  });
});
