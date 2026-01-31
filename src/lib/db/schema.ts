import { pgTable, uuid, varchar, integer, timestamp, date, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { decimalNumber } from './custom-types';
import { Decimal } from '@/lib/decimal';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID (string, not UUID)
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const leases = pgTable('leases', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),

  // Vehicle information (optional - progressive disclosure)
  make: varchar('make', { length: 100 }),
  model: varchar('model', { length: 100 }),
  year: integer('year'),

  // Financial terms - monetary fields with Decimal.js mapping
  msrp: decimalNumber('msrp', { precision: 10, scale: 2 }),
  netCapCost: decimalNumber('net_cap_cost', { precision: 10, scale: 2 }),
  residualValue: decimalNumber('residual_value', { precision: 10, scale: 2 }).notNull(),
  residualPercent: decimalNumber('residual_percent', { precision: 5, scale: 2 }),
  moneyFactor: decimalNumber('money_factor', { precision: 10, scale: 6 }),
  monthlyPayment: decimalNumber('monthly_payment', { precision: 10, scale: 2 }).notNull(),
  downPayment: decimalNumber('down_payment', { precision: 10, scale: 2 }),
  dispositionFee: decimalNumber('disposition_fee', { precision: 10, scale: 2 }),
  purchaseFee: decimalNumber('purchase_fee', { precision: 10, scale: 2 }),

  // Lease terms
  termMonths: integer('term_months').notNull(),
  monthsElapsed: integer('months_elapsed'),

  // Mileage tracking
  allowedMilesPerYear: integer('allowed_miles_per_year').notNull(),
  overageFeePerMile: decimalNumber('overage_fee_per_mile', { precision: 6, scale: 4 }).notNull().$defaultFn(() => new Decimal('0.25')),
  currentMileage: integer('current_mileage').notNull(),
  mileageDate: date('mileage_date', { mode: 'date' }).notNull(),

  // Location (optional)
  stateCode: varchar('state_code', { length: 2 }),

  // Lease timeline (optional)
  startDate: date('start_date', { mode: 'date' }),
  endDate: date('end_date', { mode: 'date' }),

  // Audit timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Lease = typeof leases.$inferSelect;
export type NewLease = typeof leases.$inferInsert;

export const marketValues = pgTable('market_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  leaseId: uuid('lease_id').notNull().references(() => leases.id, { onDelete: 'cascade' }),
  value: decimalNumber('value', { precision: 10, scale: 2 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(), // 'manual', 'kbb', 'edmunds', 'carvana'
  sourceLabel: varchar('source_label', { length: 100 }),
  sourceMetadata: text('source_metadata'), // JSON for future API data
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type MarketValue = typeof marketValues.$inferSelect;
export type NewMarketValue = typeof marketValues.$inferInsert;

export const usersRelations = relations(users, ({ many }) => ({
  leases: many(leases),
}));

export const leasesRelations = relations(leases, ({ one, many }) => ({
  user: one(users, {
    fields: [leases.userId],
    references: [users.id],
  }),
  marketValues: many(marketValues),
}));

export const marketValuesRelations = relations(marketValues, ({ one }) => ({
  lease: one(leases, {
    fields: [marketValues.leaseId],
    references: [leases.id],
  }),
}));
