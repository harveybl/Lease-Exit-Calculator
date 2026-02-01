import { Decimal } from '@/lib/decimal';
import { evaluateSellPrivatelyScenario } from '@/lib/calculations/scenarios/sell-privately';

/** Helper: compute base monthly payment from lease params */
function basePayment(netCapCost: Decimal, residualValue: Decimal, moneyFactor: Decimal, termMonths: number): Decimal {
  const depreciation = netCapCost.minus(residualValue).div(termMonths);
  const rentCharge = netCapCost.plus(residualValue).mul(moneyFactor);
  return depreciation.plus(rentCharge);
}

describe('evaluateSellPrivatelyScenario', () => {
  describe('profitable sale (end of lease)', () => {
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
      });

      // End of lease: leasePayoff = 18000 (no remaining depreciation)
      // No tax
      // payoffAmount = 18000 + 300 = 18300
      // Net proceeds: 28000 - 18300 = 9700

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(28000);
      expect(result.payoffAmount.toNumber()).toBe(18300);
      expect(result.netProceeds.toNumber()).toBe(9700);
      expect(result.totalCost.toNumber()).toBe(18300); // Payoff amount
      expect(result.netCost.toNumber()).toBe(-9700); // Negative = profit
      expect(result.lineItems.length).toBeGreaterThan(3); // Sale price + buyout breakdown
      expect(result.warnings.some(w => w.includes('Sales tax may apply'))).toBe(true);
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
      });

      // End of lease: payoffAmount = 18000 + 300 = 18300
      // Net proceeds: 15000 - 18300 = -3300

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(15000);
      expect(result.payoffAmount.toNumber()).toBe(18300);
      expect(result.netProceeds.toNumber()).toBe(-3300);
      expect(result.totalCost.toNumber()).toBe(18300);
      expect(result.netCost.toNumber()).toBe(3300); // Positive = cost to user
      expect(result.lineItems.length).toBeGreaterThan(3);
      expect(result.warnings.some(w => w.includes('cover the difference'))).toBe(true);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('mid-lease sale', () => {
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
      });

      // monthsRemaining = 6
      // Constant yield leasePayoff ≈ 19732.24 (vs straight-line 20000)
      // No tax
      // payoffAmount ≈ 19732.24 + 300 = 20032.24
      // Net proceeds: 28000 - 20032.24 ≈ 7967.76

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(28000);
      expect(result.payoffAmount.toNumber()).toBeCloseTo(20032.24, 0);
      expect(result.netProceeds.toNumber()).toBeCloseTo(7967.76, 0);
      expect(result.totalCost.toNumber()).toBeCloseTo(20032.24, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(-7967.76, 0);
      expect(result.lineItems.length).toBeGreaterThan(3);
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
        estimatedSalePrice: new Decimal('18300'), // Equals payoff
        residualValue,
        netCapCost,
        moneyFactor,
        monthlyPayment: basePayment(netCapCost, residualValue, moneyFactor, termMonths),
        termMonths,
        monthsElapsed: 36,
        purchaseFee: new Decimal('300'),
      });

      // End of lease: payoffAmount = 18300
      // Net proceeds: 18300 - 18300 = 0

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
      });

      // monthsRemaining = 12
      // Constant yield leasePayoff ≈ 23759.18 (vs straight-line 24000)
      // No tax
      // payoffAmount ≈ 23759.18 + 300 = 24059.18
      // Net proceeds: 30000 - 24059.18 ≈ 5940.82

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(30000);
      expect(result.payoffAmount.toNumber()).toBeCloseTo(24059.18, 0);
      expect(result.netProceeds.toNumber()).toBeCloseTo(5940.82, 0);
      expect(result.netCost.toNumber()).toBeCloseTo(-5940.82, 0);
      expect(result.warnings.some(w => w.includes('12 remaining'))).toBe(true);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('line items structure', () => {
    it('should have sale price, buyout breakdown with subItem flags, and net proceeds', () => {
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
      });

      // 7 items: Sale Price, Buyout Cost, ↳ Lease Payoff, ↳↳ Residual, ↳↳ Remaining Dep, ↳ Purchase Fee, Net Proceeds
      expect(result.lineItems).toHaveLength(7);

      // Check for sale price
      const salePriceItem = result.lineItems.find(item => item.label === 'Estimated Sale Price');
      expect(salePriceItem).toBeDefined();
      expect(salePriceItem?.amount.toNumber()).toBe(28000);
      expect(salePriceItem?.type).toBe('asset');
      expect(salePriceItem?.subItem).toBeUndefined();

      // Check for buyout cost parent (not a sub-item)
      const buyoutCostItem = result.lineItems.find(item => item.label === 'Lease Buyout Cost');
      expect(buyoutCostItem).toBeDefined();
      expect(buyoutCostItem?.subItem).toBeUndefined();

      // Check sub-items are marked
      const residualItem = result.lineItems.find(item => item.label.includes('Residual'));
      expect(residualItem).toBeDefined();
      expect(residualItem?.subItem).toBe(true);

      const depreciationItem = result.lineItems.find(item => item.label.includes('Remaining Depreciation'));
      expect(depreciationItem).toBeDefined();
      expect(depreciationItem?.subItem).toBe(true);

      const feeItem = result.lineItems.find(item => item.label.includes('Purchase Fee'));
      expect(feeItem).toBeDefined();
      expect(feeItem?.subItem).toBe(true);

      // Check for net proceeds
      const netItem = result.lineItems.find(item => item.label === 'Net Proceeds');
      expect(netItem).toBeDefined();
      expect(netItem?.amount.greaterThan(0)).toBe(true); // Profitable
      expect(netItem?.subItem).toBeUndefined();
    });
  });
});
