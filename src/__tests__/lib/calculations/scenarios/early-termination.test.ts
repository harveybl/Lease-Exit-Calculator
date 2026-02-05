import { Decimal } from '@/lib/decimal';
import { evaluateEarlyTerminationScenario } from '@/lib/calculations/scenarios/early-termination';
import { DISCLAIMERS } from '@/lib/disclaimers';

describe('evaluateEarlyTerminationScenario', () => {
  describe('option B only (no wholesale value)', () => {
    it('calculates mid-lease termination using remaining payments cap', () => {
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 18,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('395'),
      });

      // Option B: 18 remaining payments × $393.33 = $7,079.94
      // Total: $7,079.94 + $500 + $395 = $7,974.94

      expect(result.type).toBe('early-termination');
      expect(result.usedOption).toBe('b-only');
      expect(result.remainingPayments.toNumber()).toBeCloseTo(7079.94, 0);
      expect(result.optionB.toNumber()).toBeCloseTo(7079.94, 0);
      expect(result.optionA).toBeUndefined();
      expect(result.totalCost.toNumber()).toBeCloseTo(7974.94, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(7974.94, 0);
      expect(result.earlyTerminationFee.toNumber()).toBe(500);
      expect(result.dispositionFee.toNumber()).toBe(395);

      // Verify line items
      expect(result.lineItems.some(item => item.label.includes('Remaining Payments'))).toBe(true);
      expect(result.lineItems.some(item => item.label === 'Early Termination Fee')).toBe(true);
      expect(result.lineItems.some(item => item.label === 'Disposition Fee')).toBe(true);

      // Verify warnings
      expect(result.warnings.some(w => w.includes('remaining payments as the liability cap'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Contact your leasing company'))).toBe(true);

      // Verify disclaimer
      expect(result.disclaimers).toContain(DISCLAIMERS.earlyTermination);
    });

    it('calculates early termination (month 6 of 36) with first-year warning', () => {
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 6,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('395'),
      });

      // Option B: 30 remaining payments × $393.33 = $11,799.90
      // Total: $11,799.90 + $500 + $395 = $12,694.90

      expect(result.type).toBe('early-termination');
      expect(result.usedOption).toBe('b-only');
      expect(result.totalCost.toNumber()).toBeCloseTo(12694.90, 0);

      // Verify first-year warning is included
      expect(result.warnings).toContain(
        'Early termination in the first year typically incurs the highest penalties.'
      );
    });

    it('calculates near-end termination (month 33 of 36)', () => {
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 33,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('395'),
      });

      // Option B: 3 remaining payments × $393.33 = $1,179.99
      // Total: $1,179.99 + $500 + $395 = $2,074.99

      expect(result.type).toBe('early-termination');
      expect(result.usedOption).toBe('b-only');
      expect(result.totalCost.toNumber()).toBeCloseTo(2074.99, 0);
    });
  });

  describe('lesser-of formula with wholesale value', () => {
    it('uses option A when it produces lower liability', () => {
      // Scenario: Wholesale value is close to payoff → option A is small
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 18,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('395'),
        estimatedWholesaleValue: new Decimal('23000'), // Close to payoff (~24000)
      });

      // Option A: leasePayoff(~24000) - 23000 = ~$1,000
      // Option B: 18 × 393.33 = $7,079.94
      // Option A < Option B → uses Option A

      expect(result.usedOption).toBe('a');
      expect(result.optionA).toBeDefined();
      expect(result.optionA!.toNumber()).toBeLessThan(result.optionB.toNumber());
      expect(result.totalCost.toNumber()).toBeLessThan(8000); // Much less than option B + fees
    });

    it('uses option B when it produces lower liability', () => {
      // Scenario: Wholesale value is low → option A is large
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 33, // Near end → few remaining payments
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('395'),
        estimatedWholesaleValue: new Decimal('10000'), // Low value → high option A
      });

      // Option A: leasePayoff(~19000) - 10000 = ~$9,000
      // Option B: 3 × 393.33 = $1,179.99
      // Option B < Option A → uses Option B

      expect(result.usedOption).toBe('b');
      expect(result.optionA).toBeDefined();
      expect(result.optionB.toNumber()).toBeLessThan(result.optionA!.toNumber());
    });

    it('floors option A at zero when wholesale exceeds payoff', () => {
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 33,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('395'),
        estimatedWholesaleValue: new Decimal('25000'), // Higher than payoff
      });

      // Option A: payoff(~19000) - 25000 = negative → floored to 0
      // Option B: 3 × 393.33 = $1,179.99
      // Option A (0) < Option B → uses Option A

      expect(result.usedOption).toBe('a');
      expect(result.optionA!.toNumber()).toBe(0);
      // Total = 0 + 500 + 395 = $895
      expect(result.totalCost.toNumber()).toBe(895);
    });
  });

  describe('excess charges', () => {
    it('includes excess wear and mileage in option B', () => {
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 18,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('395'),
        excessWearCharge: new Decimal('500'),
        excessMileageCharge: new Decimal('300'),
      });

      // Option B: (18 × 393.33) + 500 + 300 = $7,879.94
      expect(result.usedOption).toBe('b-only');
      expect(result.optionB.toNumber()).toBeCloseTo(7879.94, 0);
      expect(result.totalCost.toNumber()).toBeCloseTo(8774.94, 0);

      // Line items should include excess charges
      expect(result.lineItems.some(item => item.label === 'Excess Wear Charge')).toBe(true);
      expect(result.lineItems.some(item => item.label === 'Excess Mileage Charge')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles zero early termination fee', () => {
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 18,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('0'),
        dispositionFee: new Decimal('395'),
      });

      expect(result.earlyTerminationFee.toNumber()).toBe(0);
      // Option B: $7,079.94 + $0 + $395 = $7,474.94
      expect(result.totalCost.toNumber()).toBeCloseTo(7474.94, 0);
    });

    it('handles zero disposition fee', () => {
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 18,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('0'),
      });

      // Option B: $7,079.94 + $500 + $0 = $7,579.94
      expect(result.totalCost.toNumber()).toBeCloseTo(7579.94, 0);
    });
  });

  describe('input validation', () => {
    it('should throw error when monthsElapsed is negative', () => {
      expect(() => evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: -1,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('0'),
      })).toThrow('monthsElapsed cannot be negative');
    });

    it('should throw error when monthsElapsed equals termMonths', () => {
      // This is now allowed as a degenerate case (0 remaining payments)
      const result = evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 36,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('395'),
      });
      
      // At lease end, no remaining payments
      expect(result.remainingPayments.toNumber()).toBe(0);
      expect(result.totalCost.toNumber()).toBe(895); // Just fees
    });

    it('should throw error when monthsElapsed exceeds termMonths', () => {
      expect(() => evaluateEarlyTerminationScenario({
        netCapCost: new Decimal('30000'),
        residualValue: new Decimal('18000'),
        moneyFactor: new Decimal('0.00125'),
        termMonths: 36,
        monthsElapsed: 40,
        monthlyPayment: new Decimal('393.33'),
        earlyTerminationFee: new Decimal('500'),
        dispositionFee: new Decimal('395'),
      })).toThrow('Cannot evaluate early termination after lease has exceeded term');
    });
  });
});
