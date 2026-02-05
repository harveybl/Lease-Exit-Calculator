import { Decimal } from '@/lib/decimal';
import { evaluateBuyoutScenario } from '@/lib/calculations/scenarios/buyout';

/** Helper: compute base monthly payment from lease params */
function basePayment(netCapCost: Decimal, residualValue: Decimal, moneyFactor: Decimal, termMonths: number): Decimal {
  const depreciation = netCapCost.minus(residualValue).div(termMonths);
  const rentCharge = netCapCost.plus(residualValue).mul(moneyFactor);
  return depreciation.plus(rentCharge);
}

describe('evaluateBuyoutScenario', () => {
  describe('end-of-lease buyout', () => {
    it('should calculate buyout without sales tax', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;

      const result = evaluateBuyoutScenario({
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('300'),
      });

      // End of lease: payoff = residualValue = 18000 (no remaining depreciation)
      // No sales tax
      // Total: 18000 + 300 = 18300

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(18000);
      expect(result.payoffAmount.toNumber()).toBe(18000);
      expect(result.remainingDepreciation.toNumber()).toBe(0);
      expect(result.purchaseFee.toNumber()).toBe(300);
      expect(result.totalCost.toNumber()).toBe(18300);
      expect(result.netCost.toNumber()).toBe(18300);
      expect(result.lineItems).toHaveLength(4);
      expect(result.warnings).toHaveLength(1); // Tax warning only
      expect(result.warnings.some(w => w.includes('Sales tax may apply'))).toBe(true);
      expect(result.disclaimers).toHaveLength(2); // general + tax
    });
  });

  describe('mid-lease buyout', () => {
    it('should calculate buyout with constant yield payoff', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;

      const result = evaluateBuyoutScenario({
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 26,
        purchaseFee: new Decimal('300'),
      });

      // monthsRemaining = 10
      // Constant yield payoff ≈ 21102.45 (vs straight-line 21333.33)
      // No sales tax
      // Total: 21102.45 + 300 ≈ 21402.45

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(18000);
      expect(result.remainingDepreciation.toNumber()).toBeCloseTo(3102.45, 0);
      expect(result.payoffAmount.toNumber()).toBeCloseTo(21102.45, 0);
      expect(result.purchaseFee.toNumber()).toBe(300);
      expect(result.totalCost.toNumber()).toBeCloseTo(21402.45, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(21402.45, 0);
      expect(result.lineItems).toHaveLength(4);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('contact your lender'))).toBe(true);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('mid-lease buyout with many remaining months', () => {
    it('should warn about payoff estimate when months remain', () => {
      const netCapCost = new Decimal('35000');
      const residualValue = new Decimal('22000');
      const moneyFactor = new Decimal('0.001');
      const termMonths = 36;

      const result = evaluateBuyoutScenario({
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 18,
        purchaseFee: new Decimal('350'),
      });

      // monthsRemaining = 18
      // Constant yield payoff ≈ 28256.13 (vs straight-line 28500)
      // No sales tax
      // Total ≈ 28256.13 + 350 = 28606.13

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(22000);
      expect(result.remainingDepreciation.toNumber()).toBeCloseTo(6256.13, 0);
      expect(result.payoffAmount.toNumber()).toBeCloseTo(28256.13, 0);
      expect(result.purchaseFee.toNumber()).toBe(350);
      expect(result.totalCost.toNumber()).toBeCloseTo(28606.13, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(28606.13, 0);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('contact your lender'))).toBe(true);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('zero purchase fee', () => {
    it('should handle zero purchase fee correctly', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('20000');
      const moneyFactor = new Decimal('0.001');
      const termMonths = 36;

      const result = evaluateBuyoutScenario({
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('0'),
      });

      // End of lease: payoff = residualValue = 20000
      // No sales tax
      // Total: 20000 + 0 = 20000

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(20000);
      expect(result.payoffAmount.toNumber()).toBe(20000);
      expect(result.purchaseFee.toNumber()).toBe(0);
      expect(result.totalCost.toNumber()).toBe(20000);
      expect(result.netCost.toNumber()).toBe(20000);
      expect(result.lineItems).toHaveLength(4);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('end-of-lease edge case', () => {
    it('should equal residualValue when monthsElapsed === termMonths', () => {
      const netCapCost = new Decimal('40000');
      const residualValue = new Decimal('25000');
      const moneyFactor = new Decimal('0.002');
      const termMonths = 36;

      const result = evaluateBuyoutScenario({
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('500'),
      });

      // At end of lease, all depreciation is paid
      // payoff = residualValue = 25000
      // remainingDepreciation = 0
      // No sales tax
      // Total: 25000 + 500 = 25500

      expect(result.remainingDepreciation.toNumber()).toBe(0);
      expect(result.payoffAmount.toNumber()).toBe(25000);
      expect(result.totalCost.toNumber()).toBe(25500);
    });
  });

  describe('GM Financial reference test', () => {
    it('should produce a payoff close to GM Financial actual quote of $87,054', () => {
      const result = evaluateBuyoutScenario({
        residualValue: new Decimal('65227.54'),
        netCapCost: new Decimal('96182.73'),
        moneyFactor: new Decimal('0.001460'),
        monthlyPayment: new Decimal('1095.53'),
        termMonths: 36,
        monthsElapsed: 10,
        purchaseFee: new Decimal('0'),
      });

      // Constant yield gives ~$87,068 — within $14 of actual $87,054
      const payoff = result.payoffAmount.toNumber();
      expect(payoff).toBeGreaterThan(87054 * 0.999); // Within 0.1% below
      expect(payoff).toBeLessThan(87054 * 1.001);    // Within 0.1% above

      // Verify the constant yield calculation
      expect(result.remainingDepreciation.toNumber()).toBeCloseTo(21841, 0);
      expect(payoff).toBeCloseTo(87068, 0);
    });
  });

  describe('line items structure', () => {
    it('should have proper line items with payoff breakdown and subItem flags', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;

      const result = evaluateBuyoutScenario({
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 31,
        purchaseFee: new Decimal('300'),
      });

      // monthsRemaining = 5
      // Constant yield payoff ≈ 19387.53

      expect(result.lineItems).toHaveLength(4);

      const payoffItem = result.lineItems.find(item => item.label === 'Payoff Amount');
      expect(payoffItem).toBeDefined();
      expect(payoffItem?.type).toBe('liability');
      expect(payoffItem?.subItem).toBeUndefined();

      const residualItem = result.lineItems.find(item => item.label.includes('Residual Value'));
      expect(residualItem).toBeDefined();
      expect(residualItem?.amount.toNumber()).toBe(18000);
      expect(residualItem?.type).toBe('liability');
      expect(residualItem?.subItem).toBe(true);

      const depreciationItem = result.lineItems.find(item => item.label.includes('Remaining Depreciation'));
      expect(depreciationItem).toBeDefined();
      expect(depreciationItem?.amount.toNumber()).toBeCloseTo(1387.53, 0);
      expect(depreciationItem?.type).toBe('liability');
      expect(depreciationItem?.subItem).toBe(true);

      const feeItem = result.lineItems.find(item => item.label === 'Purchase Fee');
      expect(feeItem).toBeDefined();
      expect(feeItem?.amount.toNumber()).toBe(300);
      expect(feeItem?.type).toBe('fee');
      expect(feeItem?.subItem).toBeUndefined();
    });
  });

  describe('input validation', () => {
    it('should throw error when monthsElapsed is negative', () => {
      expect(() => evaluateBuyoutScenario({
        residualValue: new Decimal('18000'),
        netCapCost: new Decimal('30000'),
        moneyFactor: new Decimal('0.00125'),
        monthlyPayment: new Decimal('393.33'),
        termMonths: 36,
        monthsElapsed: -1,
        purchaseFee: new Decimal('300'),
      })).toThrow('monthsElapsed cannot be negative');
    });
  });
});
