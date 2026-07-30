/**
 * Shared TypeScript types for the invoice application.
 */

/** A single line item in the invoice. */
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

/** The full invoice form state. */
export interface InvoiceState {
  clientName: string;
  notes: string;
  currency: string;
  lineItems: LineItem[];
  errors: string[];
}

/** Whitelisted string fields that SET_FIELD may update. */
export type StringField = 'clientName' | 'notes' | 'currency';

/** Discriminated union of all dispatchable actions. */
export type InvoiceAction =
  | { type: 'SET_FIELD'; field: StringField; value: string }
  | { type: 'SET_ERRORS'; errors: string[] }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM'; id: string }
  | { type: 'UPDATE_LINE_ITEM'; id: string; field: keyof Omit<LineItem, 'id'>; value: string | number };
