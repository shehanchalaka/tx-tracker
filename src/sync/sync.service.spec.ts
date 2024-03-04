import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { getQueueToken } from '@nestjs/bullmq';
import { POLL_QUEUE } from './constants';

describe('SyncService', () => {
  let service: SyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: getQueueToken(POLL_QUEUE),
          useValue: {
            add: jest.fn(),
            process: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
