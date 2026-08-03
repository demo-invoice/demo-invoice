import { describe, it, expect } from 'vitest';
import { invoiceReducer, type InvoiceAction } from '../context/InvoiceContext';
import type { InvoiceState } from '../context/InvoiceContext';

const baseState: InvoiceState = {
  invoice: {
    id: 'test-id',
    invoiceNumber: 'INV-001',
    issueDate: '2024-01-01',
    dueDate: '2024-01-31',
    fromName: 'Alice',
    fromEmail: 'alice@example.com',
    toName: 'Bob',
    toEmail: 'bob@example.com',
    lineItems: [],
    notes: '',
  },
  sendStatus: 'idle',
};

describe('invoiceReducer — SET_SEND_STATUS', () => {
  it('transitions idle → loading', () => {
    const action: InvoiceAction = { type: 'SET_SEND_STATUS', payload: 'loading' };
    const next = invoiceReducer(baseState, action);
    expect(next.sendStatus).toBe('loading');
  });

  it('transitions loading → success', () => {
    const loadingState = { ...baseState, sendStatus: 'loading' as const };
    const action: InvoiceAction = { type: 'SET_SEND_STATUS', payload: 'success' };
    const next = invoiceReducer(loadingState, action);
    expect(next.sendStatus).toBe('success');
  });

  it('transitions loading → error', () => {
    const loadingState = { ...baseState, sendStatus: 'loading' as const };
    const action: InvoiceAction = { type: 'SET_SEND_STATUS', payload: 'error' };
    const next = invoiceReducer(loadingState, action);
    expect(next.sendStatus).toBe('error');
  });

  it('transitions error → idle', () => {
    const errorState = { ...baseState, sendStatus: 'error' as const };
    const action: InvoiceAction = { type: 'SET_SEND_STATUS', payload: 'idle' };
    const next = invoiceReducer(errorState, action);
    expect(next.sendStatus).toBe('idle');
  });

  it('does not mutate invoice when updating sendStatus', () => {
    const action: InvoiceAction = { type: 'SET_SEND_STATUS', payload: 'loading' };
    const next = invoiceReducer(baseState, action);
    expect(next.invoice).toBe(baseState.invoice);
  });
});

describe('invoiceReducer — SET_INVOICE_FIELD', () => {
  it('merges partial invoice fields', () => {
    const action: InvoiceAction = {
      type: 'SET_INVOICE_FIELD',
      payload: { invoiceNumber: 'INV-999' },
    };
    const next = invoiceReducer(baseState, action);
    expect(next.invoice.invoiceNumber).toBe('INV-999');
    expect(next.invoice.fromName).toBe('Alice');
  });
});

describe('invoiceReducer — RESET_INVOICE', () => {
  it('resets sendStatus to idle', () => {
    const dirtyState = { ...baseState, sendStatus: 'error' as const };
    const action: InvoiceAction = { type: 'RESET_INVOICE' };
    const next = invoiceReducer(dirtyState, action);
    expect(next.sendStatus).toBe('idle');
  });

  it('resets invoice to defaults', () => {
    const action: InvoiceAction = { type: 'RESET_INVOICE' };
    const next = invoiceReducer(baseState, action);
    expect(next.invoice.invoiceNumber).toBe('INV-001');
    expect(next.invoice.fromName).toBe('');
  });
});
