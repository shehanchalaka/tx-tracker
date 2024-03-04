import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { KlineDataDto } from './dtos/klineData.dto';
import { KlineDataResponseEntity } from './entities/klineDataResponse.entity';

@Injectable()
export class BinanceService {
  private BASE_URL = 'https://api.binance.com';

  constructor(private readonly httpService: HttpService) {}

  async getKlineData(params: KlineDataDto): Promise<KlineDataResponseEntity> {
    const url = `${this.BASE_URL}/api/v3/klines`;
    const response = await this.httpService.axiosRef.get(url, {
      params: {
        symbol: params.symbol,
        interval: params.interval,
        startTime: params.startTime,
        endTime: params.endTime,
        limit: params.limit,
      },
    });

    const klines = response.data;

    return { total: klines.length, klines };
  }
}
