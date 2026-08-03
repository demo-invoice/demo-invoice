/** A single line item on an invoice. */
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

/** The fields that make up the active (in-progress) invoice. */
export interface ActiveInvoice {
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  total: number;
  lineItems: LineItem[];
}

/** A snapshot of an invoice that has been saved to history. */
export interface SavedInvoice extends ActiveInvoice {
  savedAt: string; // ISO timestamp
}

/** Top-level application state. */
export interface InvoiceState {
  active: ActiveInvoice;
  savedInvoices: SavedInvoice[];
}

// ---------------------------------------------------------------------------
// Discriminated action union
// ---------------------------------------------------------------------------

/** String fields that can be updated via UPDATE_STRING_FIELD. */
export type StringField = 'invoiceNumber' | 'clientName' | 'issueDate';

/** Number fields that can be updated via UPDATE_NUMBER_FIELD. */
export type NumberField = 'total';

/** Update a string field on the active invoice. */
export interface UpdateStringFieldAction {
  type: 'UPDATE_STRING_FIELD';
  field: StringField;
  value: string;
}

/**
 * Update a number field on the active invoice.
 * `total` is the only number field; TypeScript enforces the value is a number.
 */
export interface UpdateNumberFieldAction {
  type: 'UPDATE_NUMBER_FIELD';
  field: NumberField;
  value: number;
}

/** Save the current active invoice snapshot to history. */
export interface SaveInvoiceAction {
  type: 'SAVE_INVOICE';
}

/** Load a previously saved invoice snapshot into the active form. */
export interface LoadSavedInvoiceAction {
  type: 'LOAD_SAVED_INVOICE';
  payload: SavedInvoice;
}

/** Reset the active invoice to fresh defaults. */
export interface ResetInvoiceAction {
  type: 'RESET_INVOICE';
}

/** Full discriminated union of all invoice actions. */
export type InvoiceAction =
  | UpdateStringFieldAction
  | UpdateNumberFieldAction
  | SaveInvoiceAction
  | LoadSavedInvoiceAction
  | ResetInvoiceAction;
