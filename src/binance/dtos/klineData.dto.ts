export class KlineDataDto {
  symbol: string;
  interval: string;
  startTime: number;
  endTime: number;
  timeZone?: string;
  limit?: number;
}
