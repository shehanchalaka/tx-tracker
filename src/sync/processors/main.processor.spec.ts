import { Test, TestingModule } from '@nestjs/testing';
import { MainProcessor } from './main.processor';
import { EtherscanService } from '../../etherscan/etherscan.service';
import { BinanceService } from '../../binance/binance.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { PoolsService } from '../../pools/pools.service';

describe('MainProcessor', () => {
  let service: MainProcessor;
  let etherscanService: EtherscanService;
  let binanceService: BinanceService;
  let transactionsService: TransactionsService;
  let poolsService: PoolsService;

  const mockTokenTransferEventsResponse = {
    total: 1,
    events: [
      {
        blockNumber: '18359771',
        timeStamp: '1697421143',
        hash: '0x4743fd8c2eb7b8b34cee7f35841f3ea3d2a0188848a4e3fca6f52f2408e71e18',
        nonce: '1084',
        blockHash:
          '0x8d38b0fc8b29c2cf13ded83410fbb2f7ee9fac52b8ca11c3fdbb06df6225f90a',
        from: '0x132d33e01e3913c446c9e9283302a859badc20ec',
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        to: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
        value: '2500000000',
        tokenName: 'USDC',
        tokenSymbol: 'USDC',
        tokenDecimal: '6',
        transactionIndex: '59',
        gas: '245184',
        gasPrice: '5094929124',
        gasUsed: '179422',
        cumulativeGasUsed: '5114142',
        input: 'deprecated',
        confirmations: '999554',
      },
    ],
    trimmed: false,
  };

  const mockKilnesResponse = {
    total: 1,
    klines: [
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
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MainProcessor,
        {
          provide: EtherscanService,
          useValue: {
            getTokenTransferEvents: jest.fn(),
          },
        },
        {
          provide: BinanceService,
          useValue: {
            getKlineData: jest.fn(),
          },
        },
        {
          provide: TransactionsService,
          useValue: {
            bulkUpdateTransactions: jest.fn(),
          },
        },
        {
          provide: PoolsService,
          useValue: {
            setCurrentBlock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MainProcessor>(MainProcessor);
    etherscanService = module.get<EtherscanService>(EtherscanService);
    binanceService = module.get<BinanceService>(BinanceService);
    transactionsService = module.get<TransactionsService>(TransactionsService);
    poolsService = module.get<PoolsService>(PoolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('process', () => {
    it('should properly process data when all inputs are valid', async () => {
      jest
        .spyOn(etherscanService, 'getTokenTransferEvents')
        .mockResolvedValue(mockTokenTransferEventsResponse);
      jest
        .spyOn(binanceService, 'getKlineData')
        .mockResolvedValue(mockKilnesResponse);
      jest
        .spyOn(transactionsService, 'bulkUpdateTransactions')
        .mockResolvedValue(true);
      jest.spyOn(poolsService, 'setCurrentBlock').mockResolvedValue(true);

      const job = {
        data: {
          contractaddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
          address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
          startBlock: 18359771,
          endBlock: 18359771,
        },
      };

      const result = await service.process(job as any);

      expect(etherscanService.getTokenTransferEvents).toHaveBeenCalledTimes(1);
      expect(binanceService.getKlineData).toHaveBeenCalledTimes(1);
      expect(transactionsService.bulkUpdateTransactions).toHaveBeenCalledTimes(
        1,
      );
      expect(poolsService.setCurrentBlock).toHaveBeenCalledTimes(1);
      expect(result.status).toEqual(1);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0]).toMatchObject({
        hash: '0x4743fd8c2eb7b8b34cee7f35841f3ea3d2a0188848a4e3fca6f52f2408e71e18',
        blockNumber: '18359771',
        timestamp: '1697421143',
        gasPrice: '5094929124',
        gasUsed: '179422',
        transactionFeeEth: '0.000914142373286328',
        transactionFee: 2.0859540573308735,
      });
    });

    it('should return -1 when no transactions are found in the block range', async () => {
      jest
        .spyOn(etherscanService, 'getTokenTransferEvents')
        .mockResolvedValue({ total: 0, events: [], trimmed: false });
      jest
        .spyOn(binanceService, 'getKlineData')
        .mockResolvedValue({ total: 0, klines: [] });
      jest
        .spyOn(transactionsService, 'bulkUpdateTransactions')
        .mockResolvedValue(false);
      jest.spyOn(poolsService, 'setCurrentBlock').mockResolvedValue(true);

      const job = {
        data: {
          contractaddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
          address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
          startBlock: 18359774,
          endBlock: 18359775,
        },
      };

      const result = await service.process(job as any);

      expect(etherscanService.getTokenTransferEvents).toHaveBeenCalledTimes(1);
      expect(binanceService.getKlineData).toHaveBeenCalledTimes(0);
      expect(transactionsService.bulkUpdateTransactions).toHaveBeenCalledTimes(
        0,
      );
      expect(poolsService.setCurrentBlock).toHaveBeenCalledTimes(1);
      expect(poolsService.setCurrentBlock).toHaveBeenCalledWith(
        job.data.contractaddress,
        job.data.endBlock,
      );
      expect(result.status).toEqual(-1);
    });

    it('should abort processing when no klines are found', async () => {
      jest
        .spyOn(etherscanService, 'getTokenTransferEvents')
        .mockResolvedValue(mockTokenTransferEventsResponse);
      jest
        .spyOn(binanceService, 'getKlineData')
        .mockResolvedValue({ total: 0, klines: [] });
      jest
        .spyOn(transactionsService, 'bulkUpdateTransactions')
        .mockResolvedValue(false);
      jest.spyOn(poolsService, 'setCurrentBlock').mockResolvedValue(false);

      const job = {
        data: {
          contractaddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
          address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
          startBlock: 18359772,
          endBlock: 18359774,
        },
      };

      const result = await service.process(job as any);

      expect(etherscanService.getTokenTransferEvents).toHaveBeenCalledTimes(1);
      expect(binanceService.getKlineData).toHaveBeenCalledTimes(1);
      expect(transactionsService.bulkUpdateTransactions).toHaveBeenCalledTimes(
        0,
      );
      expect(poolsService.setCurrentBlock).toHaveBeenCalledTimes(0);
      expect(result.status).toEqual(-2);
    });
  });
});
