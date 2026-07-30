/**
 * Single source of truth for all invoice-related TypeScript types.
 * Every action type string used in dispatch calls must come from InvoiceAction.
 */

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceState {
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  issueDate: string;   // ISO date string
  dueDate: string;     // ISO date string
  lineItems: LineItem[];
  taxRate: number;     // percentage, e.g. 10 for 10%
  logoDataUrl: string; // base64 data URL or empty string
  notes: string;
  /** Internal: tracks the last dispatched action type for persistence guard. */
  _lastAction: string;
}

// ---------------------------------------------------------------------------
// Action union — every dispatch call must use one of these exact type strings.
// ---------------------------------------------------------------------------

export type InvoiceAction =
  | { type: 'SET_SENDER_NAME';    payload: string }
  | { type: 'SET_SENDER_EMAIL';   payload: string }
  | { type: 'SET_SENDER_ADDRESS'; payload: string }
  | { type: 'SET_CLIENT_NAME';    payload: string }
  | { type: 'SET_CLIENT_EMAIL';   payload: string }
  | { type: 'SET_CLIENT_ADDRESS'; payload: string }
  | { type: 'SET_INVOICE_NUMBER'; payload: string }
  | { type: 'SET_ISSUE_DATE';     payload: string }
  | { type: 'SET_DUE_DATE';       payload: string }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM';   payload: string }          // payload = id
  | { type: 'UPDATE_LINE_ITEM';   payload: LineItem }
  | { type: 'SET_TAX_RATE';       payload: number }
  | { type: 'SET_LOGO';           payload: string }          // base64 data URL
  | { type: 'SET_NOTES';          payload: string }
  | { type: 'RESET_INVOICE' };

/** Generates a simple unique id for line items. */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
