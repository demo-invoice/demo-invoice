/**
 * Shared TypeScript interfaces for the invoice document.
 * Consumed by context, form, and preview components.
 */

export interface LineItem {
  /** Stable identifier — use crypto.randomUUID() or nanoid() when creating */
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface SenderInfo {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  /** Optional — suppressed in preview when empty */
  phone: string;
  email: string;
}

export interface ClientInfo {
  name: string;
  addressLine1: string;
  /** Optional — suppressed in preview when empty */
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  email: string;
}

export interface InvoiceMeta {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  /** ISO 4217 currency code, e.g. "GBP" or "USD" */
  currency: string;
  /** Tax rate as a percentage, e.g. 20 for 20%. 0 suppresses the tax row. */
  taxRate: number;
}

export interface InvoiceState {
  sender: SenderInfo;
  client: ClientInfo;
  meta: InvoiceMeta;
  lineItems: LineItem[];
  /** Optional footer notes */
  notes: string;
  /** Optional logo data-URL or remote URL */
  logoUrl: string;
}

/** Actions dispatched to the invoice reducer */
export type InvoiceAction =
  | { type: 'SET_SENDER'; payload: Partial<SenderInfo> }
  | { type: 'SET_CLIENT'; payload: Partial<ClientInfo> }
  | { type: 'SET_META'; payload: Partial<InvoiceMeta> }
  | { type: 'SET_LINE_ITEMS'; payload: LineItem[] }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'SET_LOGO_URL'; payload: string }
  | { type: 'RESET' };
