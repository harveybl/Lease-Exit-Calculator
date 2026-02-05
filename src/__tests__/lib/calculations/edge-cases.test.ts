import { Decimal } from '@/lib/decimal';
import { calculateMonthlyPayment } from '@/lib/calculations/monthly-payment';
import { computeLeasePayoff } from '@/lib/calculations/lease-payoff';
import { evaluateBuyoutScenario } from '@/lib/calculations/scenarios/buyout';
import { evaluateSellPrivatelyScenario } from '@/lib/calculations/scenarios/sell-privately';
import { projectMileage } from '@/lib/calculations/mileage';

/**
 * Edge case and extreme value tests for lease calculations
 * 
 * These tests verify calculation robustness with:
 * - Very high values (luxury/commercial vehicles)
 * - Very low money factors (near-zero interest)
 * - Edge cases at lease boundaries
 */
describe('Lease Calculation Edge Cases', () => {
  describe('extreme value handling', () => {
    it('should handle very high cap cost ($100K+) without overflow', () => {
      const netCapCost = new Decimal('125000');
      const residualValue = new Decimal('75000');
      const moneyFactor = new Decimal('0.002');
      const termMonths = 36;

      const payment = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);
      
      // Payment should be reasonable: depreciation + rent
      // Depreciation: (125000-75000)/36 = 1388.89
      // Rent: (125000+75000)*0.002 = 400
      // Total: ~1788.89
      expect(payment.toNumber()).toBeCloseTo(1788.89, 0);
    });

    it('should handle very low money factor (0.0001) correctly', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.0001');
      const termMonths = 36;

      const payment = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);
      
      // Depreciation: 333.33, Rent: 4.80, Total: 338.13
      expect(payment.toNumber()).toBeCloseTo(338.13, 1);
    });

    it('should compute payoff for luxury vehicle ($150K cap cost) accurately', () => {
      const capCost = new Decimal('150000');
      const residualValue = new Decimal('90000');
      const moneyFactor = new Decimal('0.0015');
      const termMonths = 36;
      
      // Calculate proper monthly payment for this lease
      const monthlyPayment = calculateMonthlyPayment(capCost, residualValue, moneyFactor, termMonths);
      
      const payoff = computeLeasePayoff(
        capCost,
        residualValue,
        monthlyPayment,
        termMonths,
        18, // Mid-lease
        moneyFactor
      );

      // Payoff should be between residual and cap cost
      expect(payoff.toNumber()).toBeGreaterThan(residualValue.toNumber());
      expect(payoff.toNumber()).toBeLessThan(capCost.toNumber());
      
      // At mid-lease, should be roughly in the middle
      const straightLine = residualValue.plus(capCost.minus(residualValue).times(0.5));
      expect(Math.abs(payoff.toNumber() - straightLine.toNumber())).toBeLessThan(5000);
    });
  });

  describe('near-zero interest leases', () => {
    it('should use straight-line depreciation for zero-interest lease', () => {
      const capCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const termMonths = 36;
      // Pure depreciation payment (no rent charge)
      const payment = capCost.minus(residualValue).div(termMonths); // 333.33
      
      const payoff = computeLeasePayoff(
        capCost,
        residualValue,
        payment,
        termMonths,
        18
      );

      // Should use straight-line fallback
      // Expected: 18000 + (12000/36) * 18 = 24000
      expect(payoff.toNumber()).toBeCloseTo(24000, 0);
    });
  });

  describe('lease boundary conditions', () => {
    it('should handle lease at exact end (monthsElapsed = termMonths)', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;
      const payment = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

      const result = evaluateBuyoutScenario({
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: payment,
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('300'),
      });

      // At lease end, payoff = residual (no remaining depreciation)
      expect(result.payoffAmount.toNumber()).toBe(18000);
      expect(result.remainingDepreciation.toNumber()).toBe(0);
      expect(result.totalCost.toNumber()).toBe(18300); // residual + fee
    });

    it('should handle first month of lease (monthsElapsed = 1)', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;
      const payment = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

      const payoff = computeLeasePayoff(
        netCapCost,
        residualValue,
        payment,
        termMonths,
        1,
        moneyFactor
      );

      // At month 1, with annuity-due structure, 2 payments have been applied (period 0 + period 1)
      // Payoff should be significantly reduced from cap cost
      // Expected range: approximately $29,000 - $29,500
      expect(payoff.toNumber()).toBeGreaterThan(29000);
      expect(payoff.toNumber()).toBeLessThan(30000);
    });
  });

  describe('sell-privately profit scenarios', () => {
    it('should correctly handle large profit (netCost negative)', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('15000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;
      const payment = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

      // Sale price much higher than payoff (positive equity scenario)
      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('25000'),
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: payment,
        termMonths,
        monthsElapsed: 36, // End of lease
        purchaseFee: new Decimal('300'),
      });

      // At end of lease: payoff = residual + fee = 15300
      // Sale = 25000
      // Net proceeds = 25000 - 15300 = 9700 (profit)
      // Net cost = 15300 - 25000 = -9700 (negative = profit)
      
      expect(result.netProceeds.toNumber()).toBeCloseTo(9700, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(-9700, 0);
      expect(result.netCost.lessThan(0)).toBe(true); // Profit
    });

    it('should correctly handle large loss (netCost positive)', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('20000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;
      const payment = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

      // Sale price much lower than payoff (negative equity scenario)
      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('15000'),
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: payment,
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('300'),
      });

      // At end of lease: payoff = residual + fee = 20300
      // Sale = 15000
      // Net proceeds = 15000 - 20300 = -5300 (loss)
      // Net cost = 20300 - 15000 = 5300 (positive = cost)
      
      expect(result.netProceeds.toNumber()).toBeCloseTo(-5300, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(5300, 0);
      expect(result.netCost.greaterThan(0)).toBe(true); // Loss/Cost
    });
  });

  describe('mileage calculation edge cases', () => {
    it('should project correctly for very high mileage driver', () => {
      const result = projectMileage({
        currentMileage: 30000,
        monthsElapsed: 12,
        termMonths: 36,
        allowedMilesPerYear: 12000,
        overageFeePerMile: new Decimal('0.25'),
      });

      // 30000 miles in 12 months = 2500 miles/month
      // Projected: 2500 * 36 = 90000 miles
      // Allowed: 12000 * 3 = 36000 miles
      // Overage: 54000 miles * $0.25 = $13,500
      
      expect(result.averageMilesPerMonth).toBeCloseTo(2500, 0);
      expect(result.projectedEndMileage).toBe(90000);
      expect(result.projectedOverage).toBe(54000);
      expect(result.projectedOverageCost.toNumber()).toBe(13500);
    });

    it('should handle very low mileage driver (under allowance)', () => {
      const result = projectMileage({
        currentMileage: 3000,
        monthsElapsed: 12,
        termMonths: 36,
        allowedMilesPerYear: 12000,
        overageFeePerMile: new Decimal('0.25'),
      });

      // 3000 miles in 12 months = 250 miles/month
      // Projected: 250 * 36 = 9000 miles
      // Allowed: 12000 * 3 = 36000 miles
      // Overage: 0 (under allowance)
      
      expect(result.averageMilesPerMonth).toBeCloseTo(250, 0);
      expect(result.projectedEndMileage).toBe(9000);
      expect(result.projectedOverage).toBe(0);
      expect(result.projectedOverageCost.toNumber()).toBe(0);
    });
  });
});
