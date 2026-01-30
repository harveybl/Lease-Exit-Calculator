import { Decimal } from '@/lib/decimal';
import { ValuationProvider, ValuationResult } from './provider';

export class ManualValuationProvider implements ValuationProvider {
  readonly name = 'manual';

  async getMarketValue(): Promise<ValuationResult | null> {
    // Manual provider doesn't auto-fetch values
    return null;
  }

  createManualEntry(value: number): ValuationResult {
    return {
      value: new Decimal(value.toString()),
      source: 'manual',
      sourceLabel: 'Your estimate',
    };
  }
}
