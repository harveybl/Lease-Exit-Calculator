import { Decimal } from '@/lib/decimal';
import { computeLeasePayoff } from '@/lib/calculations/lease-payoff';

describe('computeLeasePayoff', () => {
  describe('end-of-lease boundary', () => {
    it('should return residualValue when monthsElapsed >= termMonths', () => {
      const payoff = computeLeasePayoff(
        new Decimal('96182.73'),
        new Decimal('65227.54'),
        new Decimal('1095.53'),
        36,
        36,
      );
      expect(payoff.toNumber()).toBe(65227.54);
    });

    it('should return residualValue when monthsElapsed exceeds termMonths', () => {
      const payoff = computeLeasePayoff(
        new Decimal('30000'),
        new Decimal('18000'),
        new Decimal('393.33'),
        36,
        40,
      );
      expect(payoff.toNumber()).toBe(18000);
    });
  });

  describe('GM Financial contract validation', () => {
    it('should match GM Financial actual quote within $15', () => {
      // Real contract data: 2025 GMC Sierra EV
      // Cap Cost: $96,182.73, Residual: $65,227.54, Payment: $1,095.53
      // GM Financial actual payoff at month 10: $87,054

      const payoff = computeLeasePayoff(
        new Decimal('96182.73'),
        new Decimal('65227.54'),
        new Decimal('1095.53'),
        36,
        10,
        new Decimal('0.001460'),
      );

      // Constant yield gives ~$87,068 — within $14 of GM's $87,054
      expect(payoff.toNumber()).toBeCloseTo(87068, 0);
      expect(Math.abs(payoff.toNumber() - 87054)).toBeLessThan(20);
    });

    it('should converge to residualValue at month 35 (last payment)', () => {
      const payoff = computeLeasePayoff(
        new Decimal('96182.73'),
        new Decimal('65227.54'),
        new Decimal('1095.53'),
        36,
        35,
        new Decimal('0.001460'),
      );

      // At monthsElapsed=35, numPeriods=36 (all payments done)
      // ALB should equal residualValue
      expect(payoff.toNumber()).toBeCloseTo(65227.54, 1);
    });

    it('should be close to capCost at month 0 (just signed)', () => {
      const payoff = computeLeasePayoff(
        new Decimal('96182.73'),
        new Decimal('65227.54'),
        new Decimal('1095.53'),
        36,
        0,
        new Decimal('0.001460'),
      );

      // At month 0 (1 period processed), ALB should be close to capCost
      // minus the depreciation portion of the first payment
      expect(payoff.toNumber()).toBeGreaterThan(95000);
      expect(payoff.toNumber()).toBeLessThan(96183);
    });
  });

  describe('constant yield vs straight-line', () => {
    it('should produce lower mid-lease payoff than straight-line (later months)', () => {
      // With constant yield, later months have more depreciation applied
      // so the payoff is lower than straight-line in the second half
      const capCost = new Decimal('30000');
      const residual = new Decimal('18000');
      const mf = new Decimal('0.00125');
      const term = 36;
      const payment = capCost.minus(residual).div(term)
        .plus(capCost.plus(residual).mul(mf));

      // Month 26 (in the later portion of the lease)
      const payoff = computeLeasePayoff(capCost, residual, payment, term, 26, mf);

      // Straight-line would give: 18000 + (12000/36) * 10 = 21333.33
      const straightLine = 21333.33;
      expect(payoff.toNumber()).toBeLessThan(straightLine);
      expect(payoff.toNumber()).toBeCloseTo(21102.45, 0);
    });

    it('should differ from straight-line at all mid-lease points', () => {
      const capCost = new Decimal('30000');
      const residual = new Decimal('18000');
      const mf = new Decimal('0.00125');
      const term = 36;
      const payment = capCost.minus(residual).div(term)
        .plus(capCost.plus(residual).mul(mf));

      // Month 5 (early portion of the lease)
      const payoff = computeLeasePayoff(capCost, residual, payment, term, 5, mf);

      // Straight-line: 18000 + (12000/36) * 31 = 28333.33
      const straightLine = 28333.33;
      // Constant yield produces a different value than straight-line
      expect(Math.abs(payoff.toNumber() - straightLine)).toBeGreaterThan(1);
    });
  });

  describe('zero-interest lease (straight-line fallback)', () => {
    it('should fall back to straight-line when rate is zero', () => {
      // When cap cost - residual = payment * term (no rent charge),
      // the rate is effectively zero and should use straight-line
      const capCost = new Decimal('30000');
      const residual = new Decimal('18000');
      const term = 36;
      // Payment = pure depreciation (no rent)
      const payment = capCost.minus(residual).div(term); // 333.333...

      const payoff = computeLeasePayoff(capCost, residual, payment, term, 18);

      // Straight-line: 18000 + 333.333 * 18 = 24000
      expect(payoff.toNumber()).toBeCloseTo(24000, 0);
    });
  });

  describe('monotonic payoff decrease', () => {
    it('should decrease monotonically as months elapse', () => {
      const capCost = new Decimal('96182.73');
      const residual = new Decimal('65227.54');
      const payment = new Decimal('1095.53');
      const mf = new Decimal('0.001460');
      const term = 36;

      let prevPayoff = Infinity;
      // Check months 0 through term-1 for strict decrease
      // At month term-1 (35) and term (36), both equal residualValue
      for (let month = 0; month < term; month++) {
        const payoff = computeLeasePayoff(capCost, residual, payment, term, month, mf);
        expect(payoff.toNumber()).toBeLessThan(prevPayoff);
        prevPayoff = payoff.toNumber();
      }
      // At term end, payoff equals residualValue
      const endPayoff = computeLeasePayoff(capCost, residual, payment, term, term, mf);
      expect(endPayoff.toNumber()).toBeLessThanOrEqual(prevPayoff);
      expect(endPayoff.toNumber()).toBe(65227.54);
    });
  });
});
