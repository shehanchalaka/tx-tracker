import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { getQueueToken } from '@nestjs/bullmq';
import { POLL_QUEUE } from './constants';
import { Queue } from 'bullmq';

describe('SyncService', () => {
  let service: SyncService;
  let pollQueue: Queue;

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
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    pollQueue = module.get<Queue>(getQueueToken(POLL_QUEUE));
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
});
