import { Test, TestingModule } from '@nestjs/testing';
import { EtherscanService } from './etherscan.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('EtherscanService', () => {
  let service: EtherscanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [EtherscanService, ConfigService],
    }).compile();

    service = module.get<EtherscanService>(EtherscanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
