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

describe('invoiceReducer', () => {
  it('UPDATE_INVOICE_STATUS sets status to Sent', () => {
    const action: InvoiceAction = { type: 'UPDATE_INVOICE_STATUS', payload: 'Sent' };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.status).toBe('Sent');
  });

  it('UPDATE_INVOICE_STATUS sets status to Paid', () => {
    const action: InvoiceAction = { type: 'UPDATE_INVOICE_STATUS', payload: 'Paid' };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.status).toBe('Paid');
  });

  it('UPDATE_INVOICE_STATUS does not mutate other fields', () => {
    const action: InvoiceAction = { type: 'UPDATE_INVOICE_STATUS', payload: 'Sent' };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.clientName).toBe(baseInvoice.clientName);
    expect(next.number).toBe(baseInvoice.number);
  });

  it('SET_INVOICE replaces the entire invoice', () => {
    const newInvoice: Invoice = { ...baseInvoice, id: '2', number: '002', status: 'Paid' };
    const action: InvoiceAction = { type: 'SET_INVOICE', payload: newInvoice };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.id).toBe('2');
    expect(next.status).toBe('Paid');
  });

  it('SET_INVOICE defaults status to Draft when absent', () => {
    // Simulate a legacy invoice object without status
    const legacy = { ...baseInvoice } as Invoice;
    // Force-remove status to simulate legacy data
    (legacy as Partial<Invoice>).status = undefined as unknown as Invoice['status'];
    const action: InvoiceAction = { type: 'SET_INVOICE', payload: legacy };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.status).toBe('Draft');
  });

  it('UPDATE_FIELD patches a single field', () => {
    const action: InvoiceAction = {
      type: 'UPDATE_FIELD',
      payload: { field: 'clientName', value: 'New Client' },
    };
    const next = invoiceReducer(baseInvoice, action);
    expect(next.clientName).toBe('New Client');
    expect(next.status).toBe('Draft');
  });

  it('unrecognised action type returns state unchanged (CI guard)', () => {
    // Cast to bypass TS exhaustiveness — simulates a runtime unknown action
    const action = { type: 'UNKNOWN_ACTION' } as unknown as InvoiceAction;
    const next = invoiceReducer(baseInvoice, action);
    expect(next).toBe(baseInvoice); // referential equality — no copy made
  });

  it('UPDATE_INVOICE_STATUS with unrecognised value returns state unchanged', () => {
    const action = {
      type: 'UPDATE_INVOICE_STATUS',
      payload: 'Archived',
    } as unknown as InvoiceAction;
    const next = invoiceReducer(baseInvoice, action);
    expect(next.status).toBe('Draft');
  });
});
