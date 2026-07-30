/** A single line item on the invoice. */
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Full invoice state stored in context and persisted to localStorage.
 * `_lastAction` is an internal field used by the persistence effect
 * to decide whether to skip setItem (e.g. after RESET_INVOICE).
 */
export interface InvoiceState {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  lineItems: LineItem[];
  notes: string;
  /** Internal: tracks the last dispatched action type. */
  _lastAction: string;
}

/** Discriminated union of all invoice actions. */
export type InvoiceAction =
  | { type: 'SET_INVOICE_NUMBER'; payload: string }
  | { type: 'SET_ISSUE_DATE'; payload: string }
  | { type: 'SET_DUE_DATE'; payload: string }
  | { type: 'SET_FROM_NAME'; payload: string }
  | { type: 'SET_FROM_EMAIL'; payload: string }
  | { type: 'SET_TO_NAME'; payload: string }
  | { type: 'SET_TO_EMAIL'; payload: string }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM'; payload: string }
  | { type: 'UPDATE_LINE_ITEM'; payload: LineItem }
  | { type: 'RESET_INVOICE' };

/** Shape of the value exposed by InvoiceContext. */
export interface InvoiceContextType {
  state: InvoiceState;
  dispatch: React.Dispatch<InvoiceAction>;
}
