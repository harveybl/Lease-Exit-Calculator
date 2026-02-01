import { Decimal } from '@/lib/decimal';
import { evaluateSellPrivatelyScenario } from '@/lib/calculations/scenarios/sell-privately';

/** Helper: compute base monthly payment from lease params */
function basePayment(netCapCost: Decimal, residualValue: Decimal, moneyFactor: Decimal, termMonths: number): Decimal {
  const depreciation = netCapCost.minus(residualValue).div(termMonths);
  const rentCharge = netCapCost.plus(residualValue).mul(moneyFactor);
  return depreciation.plus(rentCharge);
}

describe('evaluateSellPrivatelyScenario', () => {
  describe('profitable sale in TX (end of lease)', () => {
    it('should calculate positive net proceeds when sale price exceeds payoff', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;

      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('28000'),
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

      // End of lease: leasePayoff = 18000 (no remaining depreciation)
      // TX tax: 18000 * 0.0625 = 1125
      // payoffAmount = 18000 + 300 + 1125 = 19425
      // Net proceeds: 28000 - 19425 = 8575

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(28000);
      expect(result.payoffAmount.toNumber()).toBe(19425);
      expect(result.netProceeds.toNumber()).toBe(8575);
      expect(result.totalCost.toNumber()).toBe(19425); // Payoff amount
      expect(result.netCost.toNumber()).toBe(-8575); // Negative = profit
      expect(result.lineItems.length).toBeGreaterThan(4); // Sale price + buyout breakdown
      expect(result.warnings).toHaveLength(0); // Profitable, end of lease
      expect(result.disclaimers).toHaveLength(3); // general + tax + marketValue
    });
  });

  describe('loss sale', () => {
    it('should calculate negative net proceeds when payoff exceeds sale price', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;

      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('15000'),
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

      // End of lease: payoffAmount = 18000 + 300 + 1125 = 19425
      // Net proceeds: 15000 - 19425 = -4425

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(15000);
      expect(result.payoffAmount.toNumber()).toBe(19425);
      expect(result.netProceeds.toNumber()).toBe(-4425);
      expect(result.totalCost.toNumber()).toBe(19425);
      expect(result.netCost.toNumber()).toBe(4425); // Positive = cost to user
      expect(result.lineItems.length).toBeGreaterThan(4);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('cover the difference'))).toBe(true);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('mid-lease sale in CA', () => {
    it('should include remaining depreciation in payoff calculation', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;

      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('28000'),
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 30,
        purchaseFee: new Decimal('300'),
        stateCode: 'CA',
      });

      // monthsRemaining = 6
      // Constant yield leasePayoff ≈ 19732.24 (vs straight-line 20000)
      // CA tax: 18000 * 0.0725 = 1305
      // payoffAmount ≈ 19732.24 + 300 + 1305 = 21337.24
      // Net proceeds: 28000 - 21337.24 ≈ 6662.76

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(28000);
      expect(result.payoffAmount.toNumber()).toBeCloseTo(21337.24, 0);
      expect(result.netProceeds.toNumber()).toBeCloseTo(6662.76, 0);
      expect(result.totalCost.toNumber()).toBeCloseTo(21337.24, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(-6662.76, 0);
      expect(result.lineItems.length).toBeGreaterThan(4);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('timing'))).toBe(true);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('break-even scenario', () => {
    it('should handle near-zero net proceeds', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;

      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('19425'),
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

      // End of lease: payoffAmount = 19425
      // Net proceeds: 19425 - 19425 = 0

      expect(result.type).toBe('sell-privately');
      expect(result.netProceeds.toNumber()).toBe(0);
      expect(result.netCost.toNumber()).toBe(0);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('profitable sale with many remaining months', () => {
    it('should warn about timing and show positive equity', () => {
      const netCapCost = new Decimal('32000');
      const residualValue = new Decimal('20000');
      const moneyFactor = new Decimal('0.001');
      const termMonths = 36;

      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('30000'),
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 24,
        purchaseFee: new Decimal('300'),
        stateCode: 'FL',
      });

      // monthsRemaining = 12
      // Constant yield leasePayoff ≈ 23759.18 (vs straight-line 24000)
      // FL tax: 20000 * 0.06 = 1200
      // payoffAmount ≈ 23759.18 + 300 + 1200 = 25259.18
      // Net proceeds: 30000 - 25259.18 ≈ 4740.82

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(30000);
      expect(result.payoffAmount.toNumber()).toBeCloseTo(25259.18, 0);
      expect(result.netProceeds.toNumber()).toBeCloseTo(4740.82, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(-4740.82, 0);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('12 remaining'))).toBe(true);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('no-tax state sale (OR)', () => {
    it('should calculate with zero sales tax', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;

      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('25000'),
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('300'),
        stateCode: 'OR',
      });

      // End of lease, OR has no sales tax
      // payoffAmount = 18000 + 300 + 0 = 18300
      // Net proceeds: 25000 - 18300 = 6700

      expect(result.type).toBe('sell-privately');
      expect(result.payoffAmount.toNumber()).toBe(18300);
      expect(result.netProceeds.toNumber()).toBe(6700);
      expect(result.netCost.toNumber()).toBe(-6700);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('line items structure', () => {
    it('should have sale price, buyout breakdown, and net proceeds', () => {
      const netCapCost = new Decimal('30000');
      const residualValue = new Decimal('18000');
      const moneyFactor = new Decimal('0.00125');
      const termMonths = 36;

      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('28000'),
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 33,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

      // monthsRemaining = 3
      // Constant yield leasePayoff ≈ 18695.51

      expect(result.lineItems.length).toBeGreaterThan(4);

      // Check for sale price
      const salePriceItem = result.lineItems.find(item => item.label === 'Estimated Sale Price');
      expect(salePriceItem).toBeDefined();
      expect(salePriceItem?.amount.toNumber()).toBe(28000);
      expect(salePriceItem?.type).toBe('asset');

      // Check for buyout breakdown components
      const residualItem = result.lineItems.find(item => item.label.includes('Residual'));
      expect(residualItem).toBeDefined();
      expect(residualItem?.amount.toNumber()).toBe(18000);

      const depreciationItem = result.lineItems.find(item => item.label.includes('Remaining Depreciation'));
      expect(depreciationItem).toBeDefined();
      expect(depreciationItem?.amount.toNumber()).toBeCloseTo(695.51, 0);

      const feeItem = result.lineItems.find(item => item.label.includes('Purchase Fee'));
      expect(feeItem).toBeDefined();
      expect(feeItem?.amount.toNumber()).toBe(300);

      const taxItem = result.lineItems.find(item => item.label.includes('Tax'));
      expect(taxItem).toBeDefined();

      // Check for net proceeds
      const netItem = result.lineItems.find(item => item.label === 'Net Proceeds');
      expect(netItem).toBeDefined();
      expect(netItem?.amount.greaterThan(0)).toBe(true); // Profitable
    });
  });
});
