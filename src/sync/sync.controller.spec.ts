import { Test, TestingModule } from '@nestjs/testing';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

describe('SyncController', () => {
  let controller: SyncController;
  let syncService: SyncService;

  const mockResponse = {
    status: '8 blocks behind',
    latestBlock: 18359771,
    currentSyncBlock: 18359763,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncController],
      providers: [
        {
          provide: SyncService,
          useValue: {
            getSyncStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SyncController>(SyncController);
    syncService = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSyncStatus', () => {
    it('should return the sync status correctly', async () => {
      jest.spyOn(syncService, 'getSyncStatus').mockResolvedValue(mockResponse);

      const result = await controller.getSyncStatus();

      expect(result).toEqual(mockResponse);
    });
  });
});
