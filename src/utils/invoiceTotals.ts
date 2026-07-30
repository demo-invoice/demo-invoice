/**
 * Pure utility functions for invoice totals derivation.
 * No side effects, no state mutation.
 */
import type { LineItem } from '../types/invoice';

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
}

/**
 * Derives subtotal, tax amount, and grand total from line items and tax rate.
 *
 * @param lineItems - Array of line items from invoice state.
 * @param taxRate   - Tax percentage (e.g. 20 for 20%). Pass 0 to suppress tax.
 * @returns         Computed totals as plain numbers (not yet formatted).
 *
 * @example
 * deriveInvoiceTotals([{ id:'1', description:'Widget', quantity:3, unitPrice:1.10 }], 20)
 * // => { subtotal: 3.30, taxAmount: 0.66, grandTotal: 3.96 }
 */
export function deriveInvoiceTotals(
  lineItems: LineItem[],
  taxRate: number,
): InvoiceTotals {
  const subtotal = lineItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0,
  );

  // Round to 2 decimal places to avoid floating-point drift before tax calc
  const subtotalRounded = Math.round(subtotal * 100) / 100;
  const taxAmount = Math.round(subtotalRounded * (taxRate / 100) * 100) / 100;
  const grandTotal = Math.round((subtotalRounded + taxAmount) * 100) / 100;

  return { subtotal: subtotalRounded, taxAmount, grandTotal };
}

/**
 * Formats a numeric amount as a localised currency string.
 *
 * @param amount   - Numeric value to format.
 * @param currency - ISO 4217 currency code (default: 'GBP').
 * @returns        Formatted string, e.g. '£3.30' or '$3.30'.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'GBP',
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
