/**
 * Core domain types for the invoice feature.
 * InvoiceAction is a discriminated union — every action type is a named
 * constant so the reducer and tests share a single source of truth.
 */

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  notes: string;
  status: InvoiceStatus;
}

// ── Action union ──────────────────────────────────────────────────────────────

export interface SetInvoiceAction {
  type: 'SET_INVOICE';
  payload: Invoice;
}

export interface UpdateFieldAction {
  type: 'UPDATE_FIELD';
  payload: { field: keyof Invoice; value: Invoice[keyof Invoice] };
}

export interface UpdateInvoiceStatusAction {
  type: 'UPDATE_INVOICE_STATUS';
  payload: InvoiceStatus;
}

export type InvoiceAction =
  | SetInvoiceAction
  | UpdateFieldAction
  | UpdateInvoiceStatusAction;
