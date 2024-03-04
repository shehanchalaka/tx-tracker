import { Test, TestingModule } from '@nestjs/testing';
import { EtherscanService } from './etherscan.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('EtherscanService', () => {
  let service: EtherscanService;
  let httpService: HttpService;

  const mockResponse = {
    data: {
      status: '1',
      message: 'OK',
      result: [
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
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EtherscanService,
        ConfigService,
        {
          provide: HttpService,
          useValue: {
            axiosRef: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EtherscanService>(EtherscanService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokenTransferEvents', () => {
    it('should return token transfer events when correct values are passed', async () => {
      httpService.axiosRef.get = jest.fn().mockResolvedValueOnce(mockResponse);
      const result = await service.getTokenTransferEvents({
        contractaddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
        startblock: 18344771,
        endblock: 18359771,
      });
      expect(result.total).toEqual(1);
      expect(result.events).toHaveLength(1);
    });
  });
});
