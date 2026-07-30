/**
 * Shared TypeScript types for the invoice domain.
 * Imported by context, form, and preview components.
 */

/** A single line item on the invoice. */
export interface LineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

/** Complete invoice state shape managed by the reducer. */
export interface InvoiceState {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  // Sender
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress1: string;
  senderAddress2: string;
  // Bill To
  billToName: string;
  billToEmail: string;
  billToPhone: string;
  billToAddress1: string;
  billToAddress2: string;
  // Line items & totals
  lineItems: LineItem[];
  taxRate: string;
  // Notes
  notes: string;
}

/** Discriminated union of all reducer actions. */
export type InvoiceAction =
  | { type: 'UPDATE_FIELD'; field: keyof Omit<InvoiceState, 'lineItems'>; value: string }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM'; id: string }
  | { type: 'UPDATE_LINE_ITEM'; id: string; field: keyof Omit<LineItem, 'id'>; value: string };
