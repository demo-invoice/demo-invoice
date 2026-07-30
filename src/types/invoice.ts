/**
 * Core domain types for the invoice application.
 */

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface SenderInfo {
  name: string;
  email: string;
  address: string;
}

export interface ClientInfo {
  name: string;
  email: string;
  address: string;
}

export interface InvoiceState {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  sender: SenderInfo;
  client: ClientInfo;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  /** Data URL or object URL for the logo image. Empty string if none. */
  logo: string;
  /** MIME type of the logo. May be empty string for SVG edge case. */
  logoMime: string;
}

// ---------------------------------------------------------------------------
// Typed action union — only these action types are recognised by the reducer.
// ---------------------------------------------------------------------------

export type InvoiceAction =
  | { type: 'UPDATE_FIELD'; field: keyof Omit<InvoiceState, 'sender' | 'client' | 'lineItems'>; value: string | number }
  | { type: 'UPDATE_SENDER'; field: keyof SenderInfo; value: string }
  | { type: 'UPDATE_CLIENT'; field: keyof ClientInfo; value: string }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM'; id: string }
  | { type: 'UPDATE_LINE_ITEM'; id: string; field: keyof Omit<LineItem, 'id'>; value: string | number }
  | { type: 'SET_LOGO'; dataUrl: string; mime: string }
  | { type: 'RESET' };
