import { Decimal } from '@/lib/decimal';

/**
 * Computes the Balance Subject to Rent Charge (BSRC) after k periods
 * using the constant yield method.
 *
 * Formula: BSRC_k = startBSRC * (1+r)^k - payment * ((1+r)^k - 1) / r
 *
 * When rate is effectively zero, uses straight-line:
 *   BSRC_k = startBSRC - payment * k
 */
function bsrcAtPeriod(
  startBSRC: Decimal,
  payment: Decimal,
  rate: Decimal,
  periods: number
): Decimal {
  if (periods === 0) {
    return startBSRC;
  }

  if (rate.abs().lessThan(new Decimal('1e-10'))) {
    // Zero-rate fallback: straight-line
    return startBSRC.minus(payment.mul(periods));
  }

  const onePlusR = rate.plus(1);
  const powK = onePlusR.pow(periods);

  // startBSRC * (1+r)^k - payment * ((1+r)^k - 1) / r
  return startBSRC.mul(powK).minus(
    payment.mul(powK.minus(1)).div(rate)
  );
}

/**
 * Solves for the implicit monthly rate using Newton-Raphson.
 *
 * Finds r such that:
 *   bsrcAtPeriod(startBSRC, payment, r, numPeriods) = targetBSRC
 *
 * Uses numerical differentiation for the derivative.
 *
 * @returns Implicit monthly rate, or null if solver fails to converge
 */
function solveImplicitRate(
  startBSRC: Decimal,
  payment: Decimal,
  numPeriods: number,
  targetBSRC: Decimal,
  initialGuess?: Decimal
): Decimal | null {
  const maxIterations = 100;
  const tolerance = new Decimal('1e-10');
  const h = new Decimal('1e-8');

  let rate = initialGuess ?? new Decimal('0.003');

  for (let i = 0; i < maxIterations; i++) {
    const fVal = bsrcAtPeriod(startBSRC, payment, rate, numPeriods).minus(targetBSRC);

    if (fVal.abs().lessThan(tolerance)) {
      return rate;
    }

    // Numerical derivative: f'(r) ≈ (f(r+h) - f(r-h)) / (2h)
    const fPlus = bsrcAtPeriod(startBSRC, payment, rate.plus(h), numPeriods).minus(targetBSRC);
    const fMinus = bsrcAtPeriod(startBSRC, payment, rate.minus(h), numPeriods).minus(targetBSRC);
    const derivative = fPlus.minus(fMinus).div(h.mul(2));

    if (derivative.abs().lessThan(new Decimal('1e-15'))) {
      return null; // Derivative too flat
    }

    rate = rate.minus(fVal.div(derivative));

    // Guard: rate should not go negative
    if (rate.lessThanOrEqualTo(0)) {
      return new Decimal('0');
    }
  }

  return null; // Did not converge
}

/**
 * Computes the lease payoff (Adjusted Lease Balance) using the
 * Constant Yield Method as defined in lease contracts (e.g., GM Financial §22).
 *
 * The Constant Yield Method computes each period's rent charge as a
 * proportion of the outstanding balance, like mortgage amortization.
 * This produces more accurate mid-lease payoff estimates than
 * straight-line depreciation.
 *
 * Annuity-due structure: the first base payment is made at lease signing.
 *   BSRC_0 = capCost - monthlyPayment
 *   BSRC_N = residualValue - monthlyPayment  (after all N periods)
 *   ALB    = BSRC + monthlyPayment
 *
 * Falls back to straight-line depreciation if the implicit rate solver
 * fails to converge (e.g., zero-interest leases).
 *
 * @param capCost - Adjusted capitalized cost (Item 7C)
 * @param residualValue - Residual value (Item 7D)
 * @param monthlyPayment - Base monthly payment (Item 7I)
 * @param termMonths - Lease term in months
 * @param monthsElapsed - Months elapsed since lease start
 * @param moneyFactor - Money factor hint for solver initial guess (optional)
 * @returns Lease payoff amount (Adjusted Lease Balance)
 */
export function computeLeasePayoff(
  capCost: Decimal,
  residualValue: Decimal,
  monthlyPayment: Decimal,
  termMonths: number,
  monthsElapsed: number,
  moneyFactor?: Decimal
): Decimal {
  // End of lease or beyond: payoff = residualValue
  if (monthsElapsed >= termMonths) {
    return residualValue;
  }

  // Annuity-due: first payment at signing reduces starting balance
  const startBSRC = capCost.minus(monthlyPayment);
  const endBSRC = residualValue.minus(monthlyPayment);

  // Solve for implicit monthly rate
  const initialGuess = moneyFactor ? moneyFactor.mul(2) : undefined;
  const rate = solveImplicitRate(
    startBSRC,
    monthlyPayment,
    termMonths,
    endBSRC,
    initialGuess
  );

  if (rate === null || rate.abs().lessThan(new Decimal('1e-10'))) {
    // Fallback to straight-line depreciation
    const monthlyDep = capCost.minus(residualValue).div(termMonths);
    const monthsRemaining = termMonths - monthsElapsed;
    return residualValue.add(monthlyDep.mul(monthsRemaining));
  }

  // Number of periods elapsed: monthsElapsed + 1
  // The +1 accounts for the signing payment (period 0)
  const numPeriods = Math.min(monthsElapsed + 1, termMonths);

  // Compute current BSRC
  const currentBSRC = bsrcAtPeriod(startBSRC, monthlyPayment, rate, numPeriods);

  // ALB = BSRC + monthlyPayment
  return currentBSRC.plus(monthlyPayment);
}
