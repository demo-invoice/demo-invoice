/**
 * Shared TypeScript interfaces for the invoice domain.
 * Single source of truth consumed by the store, preview component, and future form components.
 */

/** A single line item on the invoice. */
export interface LineItem {
  /** Unique identifier for the row. */
  id: string;
  /** Human-readable description of the product or service. */
  description: string;
  /** Quantity (may be fractional; may be negative for credits). */
  quantity: number;
  /** Unit price in the invoice currency (may be negative). */
  unitPrice: number;
}

/** Details about the invoice sender (your company). */
export interface SenderDetails {
  companyName: string;
  /** First line of the sender address. */
  addressLine1: string;
  /** Optional second address line. */
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
  /** Optional contact phone number. */
  phone?: string;
  email: string;
}

/** Details about the client being billed. */
export interface ClientDetails {
  name: string;
  addressLine1: string;
  /** Optional second address line. */
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
}

/** Invoice-level metadata. */
export interface InvoiceMeta {
  /** Invoice reference number; empty string renders as em-dash placeholder. */
  invoiceNumber: string;
  /** ISO date string or empty string; empty renders as em-dash placeholder. */
  issueDate: string;
  /** ISO date string or empty string; empty renders as em-dash placeholder. */
  dueDate: string;
  /** Tax rate as a percentage, e.g. 20 for 20%. */
  taxRate: number;
  /** ISO 4217 currency code, e.g. 'GBP'. */
  currency: string;
  /** Optional free-text notes appended at the bottom of the invoice. */
  notes?: string;
}

/** Complete invoice state held in the Zustand store. */
export interface InvoiceState {
  sender: SenderDetails;
  client: ClientDetails;
  meta: InvoiceMeta;
  lineItems: LineItem[];
}
