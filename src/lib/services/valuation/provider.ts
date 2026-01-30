import { Decimal } from '@/lib/decimal';

export interface ValuationResult {
  value: Decimal;
  source: string;
  sourceLabel: string;
  confidence?: 'high' | 'medium' | 'low';
  metadata?: Record<string, unknown>;
}

export interface ValuationProvider {
  readonly name: string;
  getMarketValue(params: {
    make?: string;
    model?: string;
    year?: number;
    mileage: number;
    zipCode?: string;
  }): Promise<ValuationResult | null>;
}
