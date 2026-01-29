import { Decimal } from '@/lib/decimal';
import { evaluateSellPrivatelyScenario } from '@/lib/calculations/scenarios/sell-privately';

describe('evaluateSellPrivatelyScenario', () => {
  describe('profitable sale in TX', () => {
    it('should calculate positive net proceeds when sale price exceeds payoff', () => {
      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('28000'),
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 0,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

      // Buyout: 18000 + 0 + 300 + 1125 (TX 6.25% tax) = 19425
      // Net proceeds: 28000 - 19425 = 8575

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(28000);
      expect(result.payoffAmount.toNumber()).toBe(19425);
      expect(result.netProceeds.toNumber()).toBe(8575);
      expect(result.totalCost.toNumber()).toBe(19425); // Payoff amount
      expect(result.netCost.toNumber()).toBe(-8575); // Negative = profit
      expect(result.lineItems.length).toBeGreaterThan(4); // Sale price + buyout breakdown
      expect(result.warnings).toHaveLength(0); // Profitable, no warnings
      expect(result.disclaimers).toHaveLength(3); // general + tax + marketValue
    });
  });

  describe('loss sale', () => {
    it('should calculate negative net proceeds when payoff exceeds sale price', () => {
      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('15000'),
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 0,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

      // Buyout: 18000 + 0 + 300 + 1125 = 19425
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
    it('should include remaining payments in payoff calculation', () => {
      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('28000'),
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 6,
        purchaseFee: new Decimal('300'),
        stateCode: 'CA',
      });

      // Remaining: 393.33 * 6 = 2359.98
      // CA tax: 18000 * 0.0725 = 1305
      // Buyout: 18000 + 2359.98 + 300 + 1305 = 21964.98
      // Net proceeds: 28000 - 21964.98 = 6035.02

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(28000);
      expect(result.payoffAmount.toNumber()).toBeCloseTo(21964.98, 2);
      expect(result.netProceeds.toNumber()).toBeCloseTo(6035.02, 2);
      expect(result.totalCost.toNumber()).toBeCloseTo(21964.98, 2);
      expect(result.netCost.toNumber()).toBeCloseTo(-6035.02, 2);
      expect(result.lineItems.length).toBeGreaterThan(4);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('timing'))).toBe(true);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('break-even scenario', () => {
    it('should handle near-zero net proceeds', () => {
      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('19425'),
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 0,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

      // Buyout: 19425
      // Net proceeds: 19425 - 19425 = 0

      expect(result.type).toBe('sell-privately');
      expect(result.netProceeds.toNumber()).toBe(0);
      expect(result.netCost.toNumber()).toBe(0);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('profitable sale with many remaining payments', () => {
    it('should warn about timing and show positive equity', () => {
      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('30000'),
        residualValue: new Decimal('20000'),
        monthlyPayment: new Decimal('400'),
        monthsRemaining: 12,
        purchaseFee: new Decimal('300'),
        stateCode: 'FL',
      });

      // Remaining: 400 * 12 = 4800
      // FL tax: 20000 * 0.06 = 1200
      // Buyout: 20000 + 4800 + 300 + 1200 = 26300
      // Net proceeds: 30000 - 26300 = 3700

      expect(result.type).toBe('sell-privately');
      expect(result.estimatedSalePrice.toNumber()).toBe(30000);
      expect(result.payoffAmount.toNumber()).toBe(26300);
      expect(result.netProceeds.toNumber()).toBe(3700);
      expect(result.netCost.toNumber()).toBe(-3700);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('12 remaining'))).toBe(true);
      expect(result.disclaimers).toHaveLength(3);
    });
  });

  describe('no-tax state sale (OR)', () => {
    it('should calculate with zero sales tax', () => {
      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('25000'),
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 0,
        purchaseFee: new Decimal('300'),
        stateCode: 'OR',
      });

      // OR has no sales tax
      // Buyout: 18000 + 0 + 300 + 0 = 18300
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
      const result = evaluateSellPrivatelyScenario({
        estimatedSalePrice: new Decimal('28000'),
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 3,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

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

      const remainingItem = result.lineItems.find(item => item.label.includes('Remaining'));
      expect(remainingItem).toBeDefined();
      expect(remainingItem?.amount.toNumber()).toBeCloseTo(1179.99, 2);

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
