/**
 * Represents the mutable fields of an invoice being edited.
 */
export interface ActiveInvoice {
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  total: number;
}

/**
 * A saved snapshot of an invoice, including the timestamp it was saved.
 */
export interface SavedInvoice extends ActiveInvoice {
  savedAt: string;
}

/**
 * Top-level application state for the invoice feature.
 */
export interface InvoiceState {
  active: ActiveInvoice;
  history: SavedInvoice[];
}

/** Update a single field on the active invoice. */
export interface UpdateFieldAction {
  type: 'UPDATE_FIELD';
  field: keyof ActiveInvoice;
  value: string | number;
}

/** Persist the current active invoice to history. */
export interface SaveInvoiceAction {
  type: 'SAVE_INVOICE';
}

/** Reset the active invoice to defaults. */
export interface ResetInvoiceAction {
  type: 'RESET_INVOICE';
}

/** Load a saved invoice back into the active form. */
export interface LoadSavedInvoiceAction {
  type: 'LOAD_SAVED_INVOICE';
  invoice: SavedInvoice;
}

/** Discriminated union of all invoice actions. */
export type InvoiceAction =
  | UpdateFieldAction
  | SaveInvoiceAction
  | ResetInvoiceAction
  | LoadSavedInvoiceAction;
