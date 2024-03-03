import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KlineDataDto } from './dtos/klineData.dto';

@Injectable()
export class BinanceService {
  private BASE_URL = 'https://api.binance.com';
  private apiKey = '';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = configService.get('BINANCE_API_KEY');
  }

  async getKlineData(params: KlineDataDto) {
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
