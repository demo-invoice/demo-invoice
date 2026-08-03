/**
 * Shared TypeScript types for the invoice application.
 */

/** A single line item on an invoice. */
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/** The full state of the active invoice. */
export interface InvoiceState {
  invoiceNumber: string;
  issueDate: string; // ISO string
  dueDate: string;   // ISO string
  from: string;
  to: string;
  lineItems: LineItem[];
}

/** A saved snapshot entry stored in history. */
export interface SavedInvoiceEntry {
  id: string;
  label: string;
  savedAt: string; // ISO string
  snapshot: InvoiceState;
}

/** Fully-typed discriminated union of all invoice actions. */
export type InvoiceAction =
  | { type: 'SET_INVOICE_NUMBER'; payload: string }
  | { type: 'SET_ISSUE_DATE'; payload: string }
  | { type: 'SET_DUE_DATE'; payload: string }
  | { type: 'SET_FROM'; payload: string }
  | { type: 'SET_TO'; payload: string }
  | { type: 'SET_LINE_ITEMS'; payload: LineItem[] }
  | { type: 'NEW_INVOICE' }
  | { type: 'LOAD_SAVED_INVOICE'; payload: InvoiceState };
