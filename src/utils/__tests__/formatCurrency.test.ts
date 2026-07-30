/**
 * Unit tests for the formatCurrency utility.
 *
 * Covers: JPY 0-decimal, non-JPY 2-decimal, Other with custom symbol,
 * zero values, symbol prefixing, and empty customSymbol graceful handling.
 */
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  describe('JPY', () => {
    it('formats JPY with 0 decimal places', () => {
      const result = formatCurrency(1234.56, 'JPY');
      expect(result).toBe('¥1,235');
    });

    it('formats JPY zero value correctly', () => {
      expect(formatCurrency(0, 'JPY')).toBe('¥0');
    });

    it('does not include a decimal point for JPY', () => {
      expect(formatCurrency(999.99, 'JPY')).not.toContain('.');
    });
  });

  describe('USD', () => {
    it('formats USD with 2 decimal places', () => {
      const result = formatCurrency(1234.5, 'USD');
      expect(result).toMatch(/^\$/);
      expect(result).toMatch(/[.,]\d{2}$/);
    });

    it('formats USD zero value correctly', () => {
      const result = formatCurrency(0, 'USD');
      expect(result).toMatch(/^\$/);
      expect(result).toMatch(/[.,]00$/);
    });
  });

  describe('EUR', () => {
    it('formats EUR with € prefix and 2 decimal places', () => {
      const result = formatCurrency(500, 'EUR');
      expect(result).toMatch(/^€/);
      expect(result).toMatch(/[.,]\d{2}$/);
    });
  });

  describe('GBP', () => {
    it('formats GBP with £ prefix', () => {
      expect(formatCurrency(100, 'GBP')).toMatch(/^£/);
    });
  });

  describe('AUD', () => {
    it('formats AUD with A$ prefix and 2 decimal places', () => {
      const result = formatCurrency(100, 'AUD');
      expect(result).toMatch(/^A\$/);
      expect(result).toMatch(/[.,]\d{2}$/);
    });
  });

  describe('CAD', () => {
    it('formats CAD with C$ prefix and 2 decimal places', () => {
      const result = formatCurrency(100, 'CAD');
      expect(result).toMatch(/^C\$/);
      expect(result).toMatch(/[.,]\d{2}$/);
    });
  });

  describe('Other (custom symbol)', () => {
    it('prefixes the custom symbol', () => {
      const result = formatCurrency(100, 'Other', '₿');
      expect(result).toMatch(/^₿/);
      expect(result).toMatch(/[.,]\d{2}$/);
    });

    it('renders no prefix when customSymbol is empty string', () => {
      const result = formatCurrency(100, 'Other', '');
      expect(result).toMatch(/100/);
      expect(result.charAt(0)).toMatch(/\d/);
    });

    it('renders no prefix when customSymbol is undefined', () => {
      const result = formatCurrency(100, 'Other');
      expect(result).toMatch(/100/);
    });

    it('slices customSymbol to 4 chars', () => {
      const result = formatCurrency(1, 'Other', 'ABCDE');
      expect(result.startsWith('ABCD')).toBe(true);
      expect(result.startsWith('ABCDE')).toBe(false);
    });

    it('formats Other with 2 decimal places', () => {
      const result = formatCurrency(1234.5, 'Other', '€€');
      expect(result).toMatch(/[.,]\d{2}$/);
    });
  });

  describe('symbol prefixing', () => {
    it('always prefixes the symbol before the number for USD', () => {
      const result = formatCurrency(42, 'USD');
      const dollarIndex = result.indexOf('$');
      const digitIndex = result.search(/\d/);
      expect(dollarIndex).toBeLessThan(digitIndex);
    });

    it('always prefixes ¥ before the number for JPY', () => {
      const result = formatCurrency(42, 'JPY');
      expect(result.indexOf('¥')).toBeLessThan(result.search(/\d/));
    });
  });
});
