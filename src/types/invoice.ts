/** A single line item on an invoice. */
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/** The full active invoice state managed by the reducer. */
export interface InvoiceState {
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  lineItems: LineItem[];
  total: number;
}

/** A lightweight snapshot stored in the saved invoices history list. */
export interface SavedInvoice {
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  total: number;
  /** Full state snapshot so LOAD_SAVED_INVOICE can restore everything. */
  snapshot: InvoiceState;
}

/** Discriminated union of all reducer actions. */
export type InvoiceAction =
  | { type: 'UPDATE_FIELD'; field: keyof InvoiceState; value: InvoiceState[keyof InvoiceState] }
  | { type: 'SAVE_INVOICE' }
  | { type: 'LOAD_SAVED_INVOICE'; payload: SavedInvoice }
  | { type: 'RESET_INVOICE' };
