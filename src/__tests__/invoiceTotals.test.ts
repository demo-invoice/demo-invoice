import { describe, it, expect } from 'vitest';
import { deriveInvoiceTotals, formatCurrency } from '../utils/invoiceTotals';
import type { LineItem } from '../types/invoice';

const makeItem = (
  id: string,
  description: string,
  quantity: number,
  unitPrice: number,
): LineItem => ({ id, description, quantity, unitPrice });

describe('deriveInvoiceTotals', () => {
  it('computes correct subtotal, tax, and grand total', () => {
    const items = [makeItem('1', 'Widget', 2, 10.0)];
    const result = deriveInvoiceTotals(items, 20);
    expect(result.subtotal).toBe(20.0);
    expect(result.taxAmount).toBe(4.0);
    expect(result.grandTotal).toBe(24.0);
  });

  it('handles zero tax rate — taxAmount is 0, grandTotal equals subtotal', () => {
    const items = [makeItem('1', 'Service', 1, 100.0)];
    const result = deriveInvoiceTotals(items, 0);
    expect(result.taxAmount).toBe(0);
    expect(result.grandTotal).toBe(result.subtotal);
  });

  it('returns all zeros for empty line items', () => {
    const result = deriveInvoiceTotals([], 20);
    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it('handles floating-point edge case: 3 × 1.10 = 3.30 exactly', () => {
    const items = [makeItem('1', 'Item', 3, 1.1)];
    const result = deriveInvoiceTotals(items, 0);
    expect(result.subtotal).toBe(3.3);
  });

  it('handles multiple line items', () => {
    const items = [
      makeItem('1', 'A', 2, 5.0),
      makeItem('2', 'B', 3, 10.0),
    ];
    const result = deriveInvoiceTotals(items, 10);
    expect(result.subtotal).toBe(40.0);
    expect(result.taxAmount).toBe(4.0);
    expect(result.grandTotal).toBe(44.0);
  });

  it('rounds tax amount to 2 decimal places', () => {
    const items = [makeItem('1', 'X', 1, 99.99)];
    const result = deriveInvoiceTotals(items, 17.5);
    // 99.99 * 0.175 = 17.49825 → rounds to 17.50
    expect(result.taxAmount).toBe(17.5);
    expect(result.grandTotal).toBe(117.49);
  });
});

describe('formatCurrency', () => {
  it('formats GBP correctly', () => {
    expect(formatCurrency(3.3, 'GBP')).toBe('£3.30');
  });

  it('formats USD correctly', () => {
    const result = formatCurrency(1234.5, 'USD');
    expect(result).toMatch(/\$1,234\.50|US\$1,234\.50/);
  });

  it('formats zero as £0.00', () => {
    expect(formatCurrency(0, 'GBP')).toBe('£0.00');
  });

  it('defaults to GBP when no currency provided', () => {
    expect(formatCurrency(10)).toBe('£10.00');
  });
});
