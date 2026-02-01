import Dexie, { type EntityTable } from 'dexie';

/**
 * IndexedDB schema for lease data persistence.
 * Replaces Neon Postgres + Drizzle ORM for fully client-side operation.
 *
 * Decimal values are stored as strings to preserve precision,
 * and reconverted to Decimal on read via the actions layer.
 */

export interface LeaseRecord {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  msrp: string | null;
  netCapCost: string | null;
  residualValue: string;
  residualPercent: string | null;
  moneyFactor: string | null;
  monthlyPayment: string;
  downPayment: string | null;
  dispositionFee: string | null;
  purchaseFee: string | null;
  termMonths: number;
  monthsElapsed: number | null;
  allowedMilesPerYear: number;
  overageFeePerMile: string;
  currentMileage: number;
  mileageDate: string; // ISO date string
  stateCode: string | null;
  startDate: string | null; // ISO date string
  endDate: string | null; // ISO date string
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface MarketValueRecord {
  id: string;
  leaseId: string;
  value: string;
  source: string;
  sourceLabel: string | null;
  sourceMetadata: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

class LeaseTrackerDB extends Dexie {
  leases!: EntityTable<LeaseRecord, 'id'>;
  marketValues!: EntityTable<MarketValueRecord, 'id'>;

  constructor() {
    super('LeaseTracker');
    this.version(1).stores({
      leases: 'id, updatedAt',
      marketValues: 'id, leaseId, createdAt',
    });
  }
}

export const db = new LeaseTrackerDB();
