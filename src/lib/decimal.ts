import Decimal from 'decimal.js';

// Configure Decimal.js for financial precision
// This MUST be imported before any calculation module
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
});

export { Decimal };
export type { Decimal as DecimalType };
