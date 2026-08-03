/**
 * Thin localStorage abstraction for active invoice and invoice history.
 * All functions are wrapped in try/catch and return safe defaults on error.
 */
import type { InvoiceState, SavedInvoiceEntry } from '../types/invoice';

export const INVOICE_STORAGE_KEY = 'invoice_active';
export const INVOICE_HISTORY_KEY = 'invoice_history';

/**
 * Loads the active invoice from localStorage.
 * @returns The saved InvoiceState, or null if missing or malformed.
 */
export function loadActiveInvoice(): InvoiceState | null {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InvoiceState;
  } catch {
    return null;
  }
}

/**
 * Persists the active invoice to localStorage.
 * Silently swallows errors (e.g. quota exceeded).
 */
export function saveActiveInvoice(state: InvoiceState): void {
  try {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silently swallow
  }
}

/**
 * Removes the active invoice from localStorage.
 * Does NOT touch INVOICE_HISTORY_KEY.
 */
export function clearActiveInvoice(): void {
  try {
    localStorage.removeItem(INVOICE_STORAGE_KEY);
  } catch {
    // silently swallow
  }
}

/**
 * Loads the invoice history array from localStorage.
 * @returns Array of SavedInvoiceEntry, or [] if missing or malformed.
 */
export function loadInvoiceHistory(): SavedInvoiceEntry[] {
  try {
    const raw = localStorage.getItem(INVOICE_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedInvoiceEntry[];
  } catch {
    return [];
  }
}

/**
 * Appends a new entry to the invoice history in localStorage.
 * Always appends — never upserts or deduplicates.
 * Silently swallows errors.
 */
export function appendInvoiceHistory(entry: SavedInvoiceEntry): void {
  try {
    const existing = loadInvoiceHistory();
    localStorage.setItem(INVOICE_HISTORY_KEY, JSON.stringify([...existing, entry]));
  } catch {
    // silently swallow
  }
}
