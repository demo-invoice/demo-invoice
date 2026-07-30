import type { InvoiceState } from '../types/invoice';

/** localStorage key used for invoice persistence. */
export const INVOICE_STORAGE_KEY = 'demo-invoice:state';

/**
 * Loads persisted invoice state from localStorage.
 * Returns null if nothing is stored or storage is unavailable.
 */
export function loadInvoiceState(): Partial<InvoiceState> | null {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<InvoiceState>;
  } catch {
    return null;
  }
}

/**
 * Saves invoice state to localStorage.
 * Silently swallows errors (e.g. private-browsing quota exceeded).
 */
export function saveInvoiceState(state: InvoiceState): void {
  try {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — continue without persistence.
  }
}

/**
 * Removes the persisted invoice state from localStorage.
 * Called on RESET_INVOICE so no stale blank record remains.
 */
export function clearInvoiceState(): void {
  try {
    localStorage.removeItem(INVOICE_STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}
