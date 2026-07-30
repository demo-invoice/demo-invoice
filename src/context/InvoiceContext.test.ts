import { describe, it, expect } from 'vitest';
import { invoiceReducer } from './InvoiceContext';
import type { InvoiceState, InvoiceAction } from './InvoiceContext';

const baseState: InvoiceState = {
  clientName: '',
  clientEmail: '',
  invoiceNumber: 'INV-001',
  issueDate: '2024-01-01',
  dueDate: '',
  notes: '',
  lineItems: [
    { id: 'item-1', description: 'Widget', quantity: 2, unitPrice: 10 },
  ],
};

describe('invoiceReducer', () => {
  it('SET_CLIENT_NAME updates clientName', () => {
    const action: InvoiceAction = { type: 'SET_CLIENT_NAME', payload: 'Acme' };
    const next = invoiceReducer(baseState, action);
    expect(next.clientName).toBe('Acme');
  });

  it('SET_CLIENT_EMAIL updates clientEmail', () => {
    const action: InvoiceAction = { type: 'SET_CLIENT_EMAIL', payload: 'a@b.com' };
    const next = invoiceReducer(baseState, action);
    expect(next.clientEmail).toBe('a@b.com');
  });

  it('SET_INVOICE_NUMBER updates invoiceNumber', () => {
    const action: InvoiceAction = { type: 'SET_INVOICE_NUMBER', payload: 'INV-042' };
    const next = invoiceReducer(baseState, action);
    expect(next.invoiceNumber).toBe('INV-042');
  });

  it('SET_ISSUE_DATE updates issueDate', () => {
    const action: InvoiceAction = { type: 'SET_ISSUE_DATE', payload: '2024-06-01' };
    const next = invoiceReducer(baseState, action);
    expect(next.issueDate).toBe('2024-06-01');
  });

  it('SET_DUE_DATE updates dueDate', () => {
    const action: InvoiceAction = { type: 'SET_DUE_DATE', payload: '2024-07-01' };
    const next = invoiceReducer(baseState, action);
    expect(next.dueDate).toBe('2024-07-01');
  });

  it('SET_NOTES updates notes', () => {
    const action: InvoiceAction = { type: 'SET_NOTES', payload: 'Net 30' };
    const next = invoiceReducer(baseState, action);
    expect(next.notes).toBe('Net 30');
  });

  it('ADD_LINE_ITEM appends a new blank line item', () => {
    const action: InvoiceAction = { type: 'ADD_LINE_ITEM' };
    const next = invoiceReducer(baseState, action);
    expect(next.lineItems).toHaveLength(2);
    expect(next.lineItems[1].description).toBe('');
    expect(next.lineItems[1].quantity).toBe(1);
    expect(next.lineItems[1].unitPrice).toBe(0);
  });

  it('REMOVE_LINE_ITEM removes the item with the given id', () => {
    const action: InvoiceAction = { type: 'REMOVE_LINE_ITEM', payload: 'item-1' };
    const next = invoiceReducer(baseState, action);
    expect(next.lineItems).toHaveLength(0);
  });

  it('UPDATE_LINE_ITEM updates a field on the matching item', () => {
    const action: InvoiceAction = {
      type: 'UPDATE_LINE_ITEM',
      payload: { id: 'item-1', field: 'description', value: 'Gadget' },
    };
    const next = invoiceReducer(baseState, action);
    expect(next.lineItems[0].description).toBe('Gadget');
  });

  it('UPDATE_LINE_ITEM does not mutate other items', () => {
    const stateWithTwo: InvoiceState = {
      ...baseState,
      lineItems: [
        { id: 'item-1', description: 'Widget', quantity: 2, unitPrice: 10 },
        { id: 'item-2', description: 'Doohickey', quantity: 1, unitPrice: 5 },
      ],
    };
    const action: InvoiceAction = {
      type: 'UPDATE_LINE_ITEM',
      payload: { id: 'item-1', field: 'quantity', value: 99 },
    };
    const next = invoiceReducer(stateWithTwo, action);
    expect(next.lineItems[0].quantity).toBe(99);
    expect(next.lineItems[1].quantity).toBe(1);
  });

  it('does not mutate the original state', () => {
    const action: InvoiceAction = { type: 'SET_CLIENT_NAME', payload: 'Changed' };
    invoiceReducer(baseState, action);
    expect(baseState.clientName).toBe('');
  });
});
