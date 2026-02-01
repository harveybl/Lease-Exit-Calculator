import { Decimal } from '@/lib/decimal';

/**
 * Lease data type used throughout the application.
 * Monetary fields use Decimal.js for precision.
 *
 * Previously backed by Drizzle ORM + Neon Postgres.
 * Now backed by IndexedDB via Dexie.js with the same shape.
 */
export interface Lease {
  id: string;

  // Vehicle information (optional - progressive disclosure)
  make: string | null;
  model: string | null;
  year: number | null;

  // Financial terms - monetary fields with Decimal.js
  msrp: Decimal | null;
  netCapCost: Decimal | null;
  residualValue: Decimal;
  residualPercent: Decimal | null;
  moneyFactor: Decimal | null;
  monthlyPayment: Decimal;
  downPayment: Decimal | null;
  dispositionFee: Decimal | null;
  purchaseFee: Decimal | null;

  // Lease terms
  termMonths: number;
  monthsElapsed: number | null;

  // Mileage tracking
  allowedMilesPerYear: number;
  overageFeePerMile: Decimal;
  currentMileage: number;
  mileageDate: Date;

  // Location (optional)
  stateCode: string | null;

  // Lease timeline (optional)
  startDate: Date | null;
  endDate: Date | null;

  // Audit timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketValue {
  id: string;
  leaseId: string;
  value: Decimal;
  source: string;
  sourceLabel: string | null;
  sourceMetadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}
