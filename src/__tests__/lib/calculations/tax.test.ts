import { describe, it, expect } from 'vitest';
import { Decimal } from '@/lib/decimal';
import { calculateLeaseTax } from '@/lib/calculations/tax';
import { STATE_TAX_RULES } from '@/lib/calculations/tax-rules';

describe('calculateLeaseTax', () => {
  describe('upfront tax states', () => {
    it('calculates TX (Texas) upfront tax correctly', () => {
      const result = calculateLeaseTax(
        'TX',
        new Decimal('393.33'),
        36
      );

      // Total payments = 393.33 * 36 = 14159.88
      // Upfront tax = 14159.88 * 0.0625 = 884.9925 ≈ 884.99
      expect(result.stateCode).toBe('TX');
      expect(result.timing).toBe('upfront');
      expect(result.upfrontTax.toFixed(2)).toBe('884.99');
      expect(result.monthlyTax.toString()).toBe('0');
      expect(result.totalTax.toFixed(2)).toBe('884.99');
    });

    it('calculates NY (New York) upfront tax correctly', () => {
      const result = calculateLeaseTax(
        'NY',
        new Decimal('500'),
        36
      );

      // Total payments = 500 * 36 = 18000
      // Upfront tax = 18000 * 0.04 = 720
      expect(result.stateCode).toBe('NY');
      expect(result.timing).toBe('upfront');
      expect(result.upfrontTax.toString()).toBe('720');
      expect(result.monthlyTax.toString()).toBe('0');
      expect(result.totalTax.toString()).toBe('720');
    });

    it('calculates GA (Georgia) upfront tax correctly', () => {
      const result = calculateLeaseTax(
        'GA',
        new Decimal('400'),
        36
      );

      // Total payments = 400 * 36 = 14400
      // Upfront tax = 14400 * 0.066 = 950.4
      expect(result.stateCode).toBe('GA');
      expect(result.timing).toBe('upfront');
      expect(result.upfrontTax.toString()).toBe('950.4');
      expect(result.monthlyTax.toString()).toBe('0');
      expect(result.totalTax.toString()).toBe('950.4');
    });

    it('calculates NC (North Carolina) upfront tax correctly', () => {
      const result = calculateLeaseTax(
        'NC',
        new Decimal('350'),
        36
      );

      // Total payments = 350 * 36 = 12600
      // Upfront tax = 12600 * 0.03 = 378
      expect(result.stateCode).toBe('NC');
      expect(result.timing).toBe('upfront');
      expect(result.upfrontTax.toString()).toBe('378');
      expect(result.monthlyTax.toString()).toBe('0');
      expect(result.totalTax.toString()).toBe('378');
    });
  });

  describe('monthly tax states', () => {
    it('calculates CA (California) monthly tax with cap cost reduction', () => {
      const result = calculateLeaseTax(
        'CA',
        new Decimal('393.33'),
        36,
        new Decimal('2000')
      );

      // Monthly tax = 393.33 * 0.0725 = 28.516425
      // Total from monthly = 28.516425 * 36 = 1026.5913
      // Upfront on down = 2000 * 0.0725 = 145
      // Total tax = 1026.5913 + 145 = 1171.5913 ≈ 1171.59
      expect(result.stateCode).toBe('CA');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toFixed(2)).toBe('28.52');
      expect(result.upfrontTax.toString()).toBe('145');
      expect(result.totalTax.toFixed(2)).toBe('1171.59');
    });

    it('calculates CA (California) monthly tax without cap cost reduction', () => {
      const result = calculateLeaseTax(
        'CA',
        new Decimal('393.33'),
        36
      );

      // Monthly tax = 393.33 * 0.0725 = 28.516425
      // No cap cost reduction, so upfront = 0
      expect(result.stateCode).toBe('CA');
      expect(result.timing).toBe('monthly');
      expect(result.upfrontTax.toString()).toBe('0');
      expect(result.monthlyTax.toFixed(2)).toBe('28.52');
    });

    it('calculates FL (Florida) monthly tax correctly', () => {
      const result = calculateLeaseTax(
        'FL',
        new Decimal('400'),
        36
      );

      // Monthly tax = 400 * 0.06 = 24
      // Total = 24 * 36 = 864
      expect(result.stateCode).toBe('FL');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toString()).toBe('24');
      expect(result.upfrontTax.toString()).toBe('0');
      expect(result.totalTax.toString()).toBe('864');
    });

    it('calculates PA (Pennsylvania) monthly tax correctly', () => {
      const result = calculateLeaseTax(
        'PA',
        new Decimal('350'),
        36
      );

      // Monthly tax = 350 * 0.06 = 21
      expect(result.stateCode).toBe('PA');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toString()).toBe('21');
      expect(result.totalTax.toString()).toBe('756');
    });

    it('calculates IL (Illinois) monthly tax correctly', () => {
      const result = calculateLeaseTax(
        'IL',
        new Decimal('400'),
        36
      );

      // Monthly tax = 400 * 0.0625 = 25
      expect(result.stateCode).toBe('IL');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toString()).toBe('25');
    });

    it('calculates OH (Ohio) monthly tax correctly', () => {
      const result = calculateLeaseTax(
        'OH',
        new Decimal('400'),
        36
      );

      // Monthly tax = 400 * 0.0575 = 23
      expect(result.stateCode).toBe('OH');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toString()).toBe('23');
    });

    it('calculates MI (Michigan) monthly tax correctly', () => {
      const result = calculateLeaseTax(
        'MI',
        new Decimal('400'),
        36
      );

      // Monthly tax = 400 * 0.06 = 24
      expect(result.stateCode).toBe('MI');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toString()).toBe('24');
    });

    it('calculates NJ (New Jersey) monthly tax correctly', () => {
      const result = calculateLeaseTax(
        'NJ',
        new Decimal('400'),
        36
      );

      // Monthly tax = 400 * 0.06625 = 26.5
      expect(result.stateCode).toBe('NJ');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toString()).toBe('26.5');
    });

    it('calculates VA (Virginia) monthly tax correctly', () => {
      const result = calculateLeaseTax(
        'VA',
        new Decimal('400'),
        36
      );

      // Monthly tax = 400 * 0.0415 = 16.6
      expect(result.stateCode).toBe('VA');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toString()).toBe('16.6');
    });

    it('calculates WA (Washington) monthly tax correctly', () => {
      const result = calculateLeaseTax(
        'WA',
        new Decimal('400'),
        36
      );

      // Monthly tax = 400 * 0.065 = 26
      expect(result.stateCode).toBe('WA');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toString()).toBe('26');
    });

    it('calculates AZ (Arizona) monthly tax correctly', () => {
      const result = calculateLeaseTax(
        'AZ',
        new Decimal('400'),
        36
      );

      // Monthly tax = 400 * 0.056 = 22.4
      expect(result.stateCode).toBe('AZ');
      expect(result.timing).toBe('monthly');
      expect(result.monthlyTax.toString()).toBe('22.4');
    });
  });

  describe('no tax states', () => {
    it('calculates OR (Oregon) with no tax', () => {
      const result = calculateLeaseTax(
        'OR',
        new Decimal('393.33'),
        36
      );

      expect(result.stateCode).toBe('OR');
      expect(result.timing).toBe('none');
      expect(result.upfrontTax.toString()).toBe('0');
      expect(result.monthlyTax.toString()).toBe('0');
      expect(result.totalTax.toString()).toBe('0');
    });
  });

  describe('edge cases', () => {
    it('handles zero monthly payment', () => {
      const result = calculateLeaseTax(
        'CA',
        new Decimal('0'),
        36,
        new Decimal('2000')
      );

      // Monthly tax = 0
      // Upfront on down = 2000 * 0.0725 = 145
      expect(result.monthlyTax.toString()).toBe('0');
      expect(result.upfrontTax.toString()).toBe('145');
      expect(result.totalTax.toString()).toBe('145');
    });

    it('throws error for unsupported state code', () => {
      expect(() => {
        calculateLeaseTax('XX', new Decimal('400'), 36);
      }).toThrow('Tax rules not available for state code');
      expect(() => {
        calculateLeaseTax('XX', new Decimal('400'), 36);
      }).toThrow('XX');
    });

    it('handles lowercase state codes', () => {
      const result = calculateLeaseTax(
        'ca',
        new Decimal('400'),
        36
      );

      expect(result.stateCode).toBe('CA');
      expect(result.timing).toBe('monthly');
    });
  });

  describe('all 15 states are covered', () => {
    it('has rules for all top 15 states', () => {
      const expectedStates = [
        'CA', 'TX', 'FL', 'NY', 'PA',
        'IL', 'OH', 'GA', 'NC', 'MI',
        'NJ', 'VA', 'WA', 'AZ', 'OR',
      ];

      expectedStates.forEach(stateCode => {
        expect(STATE_TAX_RULES[stateCode]).toBeDefined();
        expect(STATE_TAX_RULES[stateCode].stateCode).toBe(stateCode);
      });

      expect(Object.keys(STATE_TAX_RULES)).toHaveLength(15);
    });
  });
});
