import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenTransferEventsDto } from './dtos/tokenTransferEvents.dto';

@Injectable()
export class EtherscanService {
  private BASE_URL = 'https://api.etherscan.io/api';
  private apiKey = '';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = configService.get('ETHERSCAN_API_KEY');
  }

  async getTokenTransferEvents(params: TokenTransferEventsDto) {
    const response = await this.httpService.axiosRef.get(this.BASE_URL, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: params.contractaddress,
        address: params.address,
        page: 1,
        offset: 10000,
        startblock: params.startblock,
        endblock: params.endblock,
        sort: 'asc',
        apikey: this.apiKey,
      },
    });

    const events = response.data.result;

    return { total: events.length, events };
  }
}
