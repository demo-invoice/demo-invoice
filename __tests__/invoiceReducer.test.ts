/**
 * Unit tests for invoiceReducer (T24).
 * Covers all action types in the discriminated union and the CI guard
 * for unrecognised action types / invalid status values.
 */
import { describe, it, expect } from 'vitest';
import { invoiceReducer } from '../src/context/InvoiceContext';
import type { Invoice, InvoiceAction } from '../src/types/invoice';

const baseInvoice: Invoice = {
  id: '1',
  number: '001',
  clientName: 'Acme Corp',
  clientEmail: 'billing@acme.com',
  issueDate: '2024-01-01',
  dueDate: '2024-01-31',
  lineItems: [],
  notes: '',
  status: 'Draft',
};

// ── UPDATE_INVOICE_STATUS ─────────────────────────────────────────────────────

describe('invoiceReducer — UPDATE_INVOICE_STATUS', () => {
  it('sets status to Sent', () => {
    const action: InvoiceAction = { type: 'UPDATE_INVOICE_STATUS', payload: 'Sent' };
    expect(invoiceReducer(baseInvoice, action).status).toBe('Sent');
  });

  it('sets status to Paid', () => {
    const action: InvoiceAction = { type: 'UPDATE_INVOICE_STATUS', payload: 'Paid' };
    expect(invoiceReducer(baseInvoice, action).status).toBe('Paid');
  });

  it('sets status back to Draft', () => {
    const sentInvoice: Invoice = { ...baseInvoice, status: 'Sent' };
    const action: InvoiceAction = { type: 'UPDATE_INVOICE_STATUS', payload: 'Draft' };
    expect(invoiceReducer(sentInvoice, action).status).toBe('Draft');
  });

  it('does not mutate other fields when updating status', () => {
    const action: InvoiceAction = { type: 'UPDATE_INVOICE_STATUS', payload: 'Sent' };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.clientName).toBe(baseInvoice.clientName);
    expect(next.number).toBe(baseInvoice.number);
    expect(next.clientEmail).toBe(baseInvoice.clientEmail);
  });

  it('returns state unchanged for an unrecognised status value', () => {
    const action = {
      type: 'UPDATE_INVOICE_STATUS',
      payload: 'Archived',
    } as unknown as InvoiceAction;
    const next = invoiceReducer(baseInvoice, action);
    expect(next.status).toBe('Draft');
  });
});

// ── SET_INVOICE ───────────────────────────────────────────────────────────────

describe('invoiceReducer — SET_INVOICE', () => {
  it('replaces the entire invoice', () => {
    const newInvoice: Invoice = { ...baseInvoice, id: '2', number: '002', status: 'Paid' };
    const action: InvoiceAction = { type: 'SET_INVOICE', payload: newInvoice };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.id).toBe('2');
    expect(next.number).toBe('002');
    expect(next.status).toBe('Paid');
  });

  it('defaults status to Draft when payload status is absent (legacy invoice)', () => {
    const legacy = { ...baseInvoice } as Invoice;
    (legacy as Partial<Invoice>).status = undefined as unknown as Invoice['status'];
    const action: InvoiceAction = { type: 'SET_INVOICE', payload: legacy };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.status).toBe('Draft');
  });
});

// ── UPDATE_FIELD ──────────────────────────────────────────────────────────────

describe('invoiceReducer — UPDATE_FIELD', () => {
  it('patches clientName without affecting other fields', () => {
    const action: InvoiceAction = {
      type: 'UPDATE_FIELD',
      payload: { field: 'clientName', value: 'New Client' },
    };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.clientName).toBe('New Client');
    expect(next.status).toBe('Draft');
    expect(next.number).toBe(baseInvoice.number);
  });

  it('patches clientEmail', () => {
    const action: InvoiceAction = {
      type: 'UPDATE_FIELD',
      payload: { field: 'clientEmail', value: 'new@client.com' },
    };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.clientEmail).toBe('new@client.com');
  });

  it('patches notes', () => {
    const action: InvoiceAction = {
      type: 'UPDATE_FIELD',
      payload: { field: 'notes', value: 'Please pay promptly.' },
    };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.notes).toBe('Please pay promptly.');
  });
});

// ── Unknown action (CI guard) ─────────────────────────────────────────────────

describe('invoiceReducer — unknown action type', () => {
  it('returns the same state reference for an unrecognised action type', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as InvoiceAction;
    const next = invoiceReducer(baseInvoice, action);
    expect(next).toBe(baseInvoice);
  });
});
