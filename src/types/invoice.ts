/** A single line item on the invoice. */
export interface LineItem {
  /** Stable UUID generated at ADD_LINE_ITEM time. */
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

/** Top-level form state. */
export interface InvoiceState {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  currency: string;
  notes: string;
  lineItems: LineItem[];
  /** Map of field name → array of error messages. */
  errors: Record<string, string[]>;
}

// ── Action union ────────────────────────────────────────────────────────────

export interface SetFieldAction {
  type: 'SET_FIELD';
  payload: { field: keyof Omit<InvoiceState, 'lineItems' | 'errors'>; value: string };
}

export interface SetErrorsAction {
  type: 'SET_ERRORS';
  payload: Record<string, string[]>;
}

export interface ClearErrorsAction {
  type: 'CLEAR_ERRORS';
}

export interface AddLineItemAction {
  type: 'ADD_LINE_ITEM';
  payload: LineItem;
}

export interface RemoveLineItemAction {
  type: 'REMOVE_LINE_ITEM';
  payload: { id: string };
}

export interface UpdateLineItemAction {
  type: 'UPDATE_LINE_ITEM';
  payload: { id: string; field: keyof Omit<LineItem, 'id'>; value: string | number };
}

export type InvoiceAction =
  | SetFieldAction
  | SetErrorsAction
  | ClearErrorsAction
  | AddLineItemAction
  | RemoveLineItemAction
  | UpdateLineItemAction;
