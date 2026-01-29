import { Decimal } from '@/lib/decimal';

export interface MonthlyBreakdown {
  depreciation: Decimal;
  rentCharge: Decimal;
  monthlyPayment: Decimal;
  monthlyTax: Decimal;
  totalMonthly: Decimal;
}

export interface TotalCostBreakdown {
  totalDepreciation: Decimal;
  totalRentCharges: Decimal;
  totalPayments: Decimal;
  totalTax: Decimal;
  grandTotal: Decimal;
}

export interface MileageProjection {
  currentMileage: number;
  monthsElapsed: number;
  termMonths: number;
  averageMilesPerMonth: number;
  projectedEndMileage: number;
  allowedMiles: number;
  projectedOverage: number;
  projectedOverageCost: Decimal;
}

export interface EquityCalculation {
  marketValue: Decimal;
  buyoutCost: Decimal;
  equity: Decimal;
  hasPositiveEquity: boolean;
  lineItems: LineItem[];
}

export interface TaxResult {
  upfrontTax: Decimal;
  monthlyTax: Decimal;
  totalTax: Decimal;
  timing: 'upfront' | 'monthly' | 'none';
  stateCode: string;
}

export interface LineItem {
  label: string;
  amount: Decimal;
  description: string;
  type?: 'asset' | 'liability' | 'fee' | 'tax';
}
