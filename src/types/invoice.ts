/**
 * Shared TypeScript types for Invoice, LineItem, and InvoiceState.
 * Used across context, components, and utilities.
 */

/** A single line item on an invoice. */
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/** Top-level invoice metadata and line items. */
export interface Invoice {
  invoiceNumber: string;
  companyName: string;
  clientName: string;
  /** Pre-populated client email, settable via SET_CLIENT_EMAIL action. */
  clientEmail: string;
  issuedAt: string; // ISO date string
  dueAt: string;   // ISO date string
  /** Tax rate as a decimal, e.g. 0.1 for 10%. */
  taxRate: number;
  lineItems: LineItem[];
}

/** Shape of the InvoiceContext state. */
export interface InvoiceState {
  invoice: Invoice;
}

/** Typed action union — ALL dispatched types must appear here (T7 lesson). */
export type InvoiceAction =
  | { type: 'SET_INVOICE'; payload: Invoice }
  | { type: 'ADD_LINE_ITEM'; payload: LineItem }
  | { type: 'REMOVE_LINE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_LINE_ITEM'; payload: LineItem }
  | { type: 'SET_CLIENT_EMAIL'; payload: { email: string } }
  | { type: 'SET_INVOICE_META'; payload: Partial<Omit<Invoice, 'lineItems'>> };
