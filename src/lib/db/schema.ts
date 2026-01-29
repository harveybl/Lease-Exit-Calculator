import { pgTable, uuid, varchar, integer, timestamp, date } from 'drizzle-orm/pg-core';
import { decimalNumber } from './custom-types';

export const leases = pgTable('leases', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Vehicle information
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: integer('year').notNull(),

  // Financial terms - monetary fields with Decimal.js mapping
  msrp: decimalNumber('msrp', { precision: 10, scale: 2 }).notNull(),
  netCapCost: decimalNumber('net_cap_cost', { precision: 10, scale: 2 }).notNull(),
  residualValue: decimalNumber('residual_value', { precision: 10, scale: 2 }).notNull(),
  residualPercent: decimalNumber('residual_percent', { precision: 5, scale: 2 }).notNull(),
  moneyFactor: decimalNumber('money_factor', { precision: 10, scale: 6 }).notNull(),
  monthlyPayment: decimalNumber('monthly_payment', { precision: 10, scale: 2 }).notNull(),
  downPayment: decimalNumber('down_payment', { precision: 10, scale: 2 }).notNull(),
  dispositionFee: decimalNumber('disposition_fee', { precision: 10, scale: 2 }).notNull(),
  purchaseFee: decimalNumber('purchase_fee', { precision: 10, scale: 2 }).notNull(),

  // Lease terms
  termMonths: integer('term_months').notNull(),
  monthsElapsed: integer('months_elapsed').notNull(),

  // Mileage tracking
  allowedMilesPerYear: integer('allowed_miles_per_year').notNull(),
  overageFeePerMile: decimalNumber('overage_fee_per_mile', { precision: 6, scale: 4 }).notNull(),
  currentMileage: integer('current_mileage').notNull(),
  mileageDate: date('mileage_date', { mode: 'date' }).notNull(),

  // Location
  stateCode: varchar('state_code', { length: 2 }).notNull(),

  // Lease timeline
  startDate: date('start_date', { mode: 'date' }).notNull(),
  endDate: date('end_date', { mode: 'date' }).notNull(),

  // Audit timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Lease = typeof leases.$inferSelect;
export type NewLease = typeof leases.$inferInsert;
