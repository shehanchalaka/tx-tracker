import { Test, TestingModule } from '@nestjs/testing';
import { BinanceService } from './binance.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('BinanceService', () => {
  let service: BinanceService;
  let httpService: HttpService;

  const mockResponse = {
    data: [
      [
        1704067200000,
        '2281.87000000',
        '2287.84000000',
        '2281.27000000',
        '2287.84000000',
        '910.57010000',
        1704067499999,
        '2080313.10976900',
        2593,
        '585.72540000',
        '1338368.54697200',
        '0',
      ],
      [
        1704067500000,
        '2287.83000000',
        '2291.83000000',
        '2287.06000000',
        '2290.77000000',
        '1652.92900000',
        1704067799999,
        '3785227.33785600',
        3354,
        '1058.49510000',
        '2423909.79251500',
        '0',
      ],
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BinanceService,
        ConfigService,
        {
          provide: HttpService,
          useValue: {
            axiosRef: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BinanceService>(BinanceService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getKlineData', () => {
    it('should return kline data when correct values are passed', async () => {
      httpService.axiosRef.get = jest.fn().mockResolvedValueOnce(mockResponse);
      const result = await service.getKlineData({
        symbol: 'ETHUSDT',
        interval: '5m',
        startTime: 1704067200000, // 1 Jan 2024
        endTime: 1706659200000, // 31 Jan 2024
      });
      expect(result.total).toEqual(2);
      expect(result.klines).toHaveLength(2);
    });
  });
});
