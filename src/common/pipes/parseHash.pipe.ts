import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseHashPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const regex = new RegExp('^0x([A-Fa-f0-9]{64})$');
    if (!regex.test(value)) {
      throw new BadRequestException('hash must be a valid ethereum hash');
    }
    return value.toLowerCase();
  }
}
