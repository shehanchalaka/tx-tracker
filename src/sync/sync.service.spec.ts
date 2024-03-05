import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { getQueueToken } from '@nestjs/bullmq';
import { POLL_QUEUE } from './constants';
import { Queue } from 'bullmq';
import { EtherscanService } from '../etherscan/etherscan.service';
import { PoolsService } from '../pools/pools.service';

describe('SyncService', () => {
  let service: SyncService;
  let pollQueue: Queue;
  let etherscanService: EtherscanService;
  let poolsService: PoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: getQueueToken(POLL_QUEUE),
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

    service = module.get<SyncService>(SyncService);
    pollQueue = module.get<Queue>(getQueueToken(POLL_QUEUE));
    etherscanService = module.get<EtherscanService>(EtherscanService);
    poolsService = module.get<PoolsService>(PoolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('should properly add a job to poll queue', async () => {
      jest.spyOn(pollQueue, 'add').mockResolvedValue({ id: 1 } as any);
      const result = await service.run();
      expect(pollQueue.add).toHaveBeenCalledTimes(1);
      expect(result).toEqual(true);
    });
  });

  describe('getSyncStatus', () => {
    it('should return the sync status correctly', async () => {
      jest
        .spyOn(etherscanService, 'getBlockNumber')
        .mockResolvedValue(18359771);
      jest.spyOn(poolsService, 'getCurrentBlock').mockResolvedValue(18359763);

      const result = await service.getSyncStatus();

      expect(etherscanService.getBlockNumber).toHaveBeenCalledTimes(1);
      expect(poolsService.getCurrentBlock).toHaveBeenCalledTimes(1);
      expect(result.latestBlock).toEqual(18359771);
      expect(result.currentSyncBlock).toEqual(18359763);
      expect(result.status).toEqual('8 blocks behind');
    });
  });
});
