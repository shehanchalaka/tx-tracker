import BigNumber from 'bignumber.js';

export function pow10(n: number): BigNumber {
  return new BigNumber(10).pow(n);
}
