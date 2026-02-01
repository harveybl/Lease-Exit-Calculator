import { Decimal } from '@/lib/decimal';
import { evaluateBuyoutScenario } from '@/lib/calculations/scenarios/buyout';

/** Helper: compute base monthly payment from lease params */
function basePayment(netCapCost: Decimal, residualValue: Decimal, moneyFactor: Decimal, termMonths: number): Decimal {
  const depreciation = netCapCost.minus(residualValue).div(termMonths);
  const rentCharge = netCapCost.plus(residualValue).mul(moneyFactor);
  return depreciation.plus(rentCharge);
}

describe('evaluateBuyoutScenario', () => {
  describe('end-of-lease buyout in TX (upfront tax)', () => {
    it('should calculate buyout with TX sales tax on residual', () => {
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
        stateCode: 'TX',
      });

      // End of lease: payoff = residualValue = 18000 (no remaining depreciation)
      // TX: 6.25% sales tax on residual
      // Tax: 18000 * 0.0625 = 1125
      // Total: 18000 + 300 + 1125 = 19425

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(18000);
      expect(result.payoffAmount.toNumber()).toBe(18000);
      expect(result.remainingDepreciation.toNumber()).toBe(0);
      expect(result.purchaseFee.toNumber()).toBe(300);
      expect(result.salesTax.toNumber()).toBe(1125);
      expect(result.totalCost.toNumber()).toBe(19425);
      expect(result.netCost.toNumber()).toBe(19425);
      expect(result.lineItems).toHaveLength(5);
      expect(result.warnings).toHaveLength(0); // No remaining months
      expect(result.disclaimers).toHaveLength(2); // general + tax
    });
  });

  describe('mid-lease buyout in CA (monthly tax)', () => {
    it('should calculate buyout with CA sales tax and constant yield payoff', () => {
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
        stateCode: 'CA',
      });

      // monthsRemaining = 10
      // Constant yield payoff ≈ 21102.45 (vs straight-line 21333.33)
      // CA: 7.25% sales tax on residual = 18000 * 0.0725 = 1305
      // Total: 21102.45 + 300 + 1305 ≈ 22707.45

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(18000);
      expect(result.remainingDepreciation.toNumber()).toBeCloseTo(3102.45, 0);
      expect(result.payoffAmount.toNumber()).toBeCloseTo(21102.45, 0);
      expect(result.purchaseFee.toNumber()).toBe(300);
      expect(result.salesTax.toNumber()).toBe(1305);
      expect(result.totalCost.toNumber()).toBeCloseTo(22707.45, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(22707.45, 0);
      expect(result.lineItems).toHaveLength(5);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('contact your lender'))).toBe(true);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('no-tax state buyout (OR)', () => {
    it('should calculate buyout with zero sales tax', () => {
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
        stateCode: 'OR',
      });

      // End of lease, no remaining depreciation
      // OR has no sales tax
      // Total: 18000 + 300 + 0 = 18300

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(18000);
      expect(result.payoffAmount.toNumber()).toBe(18000);
      expect(result.remainingDepreciation.toNumber()).toBe(0);
      expect(result.purchaseFee.toNumber()).toBe(300);
      expect(result.salesTax.toNumber()).toBe(0);
      expect(result.totalCost.toNumber()).toBe(18300);
      expect(result.netCost.toNumber()).toBe(18300);
      expect(result.lineItems).toHaveLength(5);
      expect(result.warnings).toHaveLength(0);
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
        stateCode: 'FL',
      });

      // monthsRemaining = 18
      // Constant yield payoff ≈ 28256.13 (vs straight-line 28500)
      // FL: 6% sales tax on residual = 22000 * 0.06 = 1320
      // Total ≈ 28256.13 + 350 + 1320 = 29926.13

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(22000);
      expect(result.remainingDepreciation.toNumber()).toBeCloseTo(6256.13, 0);
      expect(result.payoffAmount.toNumber()).toBeCloseTo(28256.13, 0);
      expect(result.purchaseFee.toNumber()).toBe(350);
      expect(result.salesTax.toNumber()).toBe(1320);
      expect(result.totalCost.toNumber()).toBeCloseTo(29926.13, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(29926.13, 0);
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
        stateCode: 'NY',
      });

      // End of lease: payoff = residualValue = 20000
      // NY: 4% sales tax on residual
      // Tax: 20000 * 0.04 = 800
      // Total: 20000 + 0 + 800 = 20800

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(20000);
      expect(result.payoffAmount.toNumber()).toBe(20000);
      expect(result.purchaseFee.toNumber()).toBe(0);
      expect(result.salesTax.toNumber()).toBe(800);
      expect(result.totalCost.toNumber()).toBe(20800);
      expect(result.netCost.toNumber()).toBe(20800);
      expect(result.lineItems).toHaveLength(5);
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
        stateCode: 'TX',
      });

      // At end of lease, all depreciation is paid
      // payoff = residualValue = 25000
      // remainingDepreciation = 0
      // Tax: 25000 * 0.0625 = 1562.50
      // Total: 25000 + 500 + 1562.50 = 27062.50

      expect(result.remainingDepreciation.toNumber()).toBe(0);
      expect(result.payoffAmount.toNumber()).toBe(25000);
      expect(result.totalCost.toNumber()).toBe(27062.5);
    });
  });

  describe('GM Financial reference test', () => {
    it('should produce a payoff close to GM Financial actual quote of $87,054', () => {
      // Real lease data: 2025 GMC Sierra EV e4WD Crew Cab Max Range Denali
      // Source: GM Financial contract GMF-UCL-TX-e-14, lease date 03/27/2025
      //
      // Contract values (Section 7):
      //   Adjusted Cap Cost (C): $96,182.73
      //   Residual Value (D):    $65,227.54
      //   Depreciation (E):      $30,955.19
      //   Rent Charge (F):       $8,483.89
      //   Term (H):              36 months
      //   Base Payment (I):      $1,095.53
      //   Purchase Option (§9):  $65,227.54 + $0.00 fee
      //   Disposition Fee (§4A): $495.00
      //
      // GM Financial actual payoff quote: $87,054 (pulled ~Jan 2026, month 10)
      //
      // Constant Yield Method (contract §22):
      //   BSRC_0 = capCost - payment = 96,182.73 - 1,095.53 = 95,087.20
      //   BSRC_N = residual - payment = 65,227.54 - 1,095.53 = 64,132.01
      //   Implicit rate solved via Newton-Raphson ≈ 0.002944
      //   At monthsElapsed=10: numPeriods=11
      //   ALB ≈ $87,068 — within $14 of GM Financial's $87,054

      const result = evaluateBuyoutScenario({
        residualValue: new Decimal('65227.54'),
        netCapCost: new Decimal('96182.73'),
        moneyFactor: new Decimal('0.001460'),
        monthlyPayment: new Decimal('1095.53'),
        termMonths: 36,
        monthsElapsed: 10,
        purchaseFee: new Decimal('0'),
        stateCode: 'TX',
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
    it('should have proper line items with payoff breakdown', () => {
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
        stateCode: 'TX',
      });

      // monthsRemaining = 5
      // Constant yield payoff ≈ 19387.53

      expect(result.lineItems).toHaveLength(5);

      const payoffItem = result.lineItems.find(item => item.label === 'Payoff Amount');
      expect(payoffItem).toBeDefined();
      expect(payoffItem?.type).toBe('liability');

      const residualItem = result.lineItems.find(item => item.label.includes('Residual Value'));
      expect(residualItem).toBeDefined();
      expect(residualItem?.amount.toNumber()).toBe(18000);
      expect(residualItem?.type).toBe('liability');

      const depreciationItem = result.lineItems.find(item => item.label.includes('Remaining Depreciation'));
      expect(depreciationItem).toBeDefined();
      expect(depreciationItem?.amount.toNumber()).toBeCloseTo(1387.53, 0);
      expect(depreciationItem?.type).toBe('liability');

      const feeItem = result.lineItems.find(item => item.label === 'Purchase Fee');
      expect(feeItem).toBeDefined();
      expect(feeItem?.amount.toNumber()).toBe(300);
      expect(feeItem?.type).toBe('fee');

      const taxItem = result.lineItems.find(item => item.label === 'Sales Tax');
      expect(taxItem).toBeDefined();
      expect(taxItem?.amount.toNumber()).toBe(1125); // 18000 * 0.0625
      expect(taxItem?.type).toBe('tax');
    });
  });
});
