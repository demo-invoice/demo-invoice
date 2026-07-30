// globals: true — describe/it/expect are injected by vitest; do NOT import them
import { invoiceReducer } from '../context/InvoiceContext';
import type { InvoiceState, InvoiceAction } from '../types/invoice';

const baseState: InvoiceState = {
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  clientName: '',
  currency: 'USD',
  notes: '',
  lineItems: [],
  errors: {},
};

describe('invoiceReducer', () => {
  describe('SET_FIELD', () => {
    it('updates a top-level string field', () => {
      const action: InvoiceAction = {
        type: 'SET_FIELD',
        payload: { field: 'invoiceNumber', value: 'INV-001' },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.invoiceNumber).toBe('INV-001');
    });

    it('does not mutate other fields', () => {
      const action: InvoiceAction = {
        type: 'SET_FIELD',
        payload: { field: 'clientName', value: 'Acme Corp' },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.invoiceNumber).toBe('');
      expect(next.currency).toBe('USD');
    });
  });

  describe('SET_ERRORS', () => {
    it('sets errors map', () => {
      const action: InvoiceAction = {
        type: 'SET_ERRORS',
        payload: { invoiceNumber: ['Required'] },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.errors['invoiceNumber']).toEqual(['Required']);
    });
  });

  describe('CLEAR_ERRORS', () => {
    it('clears all errors', () => {
      const stateWithErrors: InvoiceState = {
        ...baseState,
        errors: { invoiceNumber: ['Required'], clientName: ['Required'] },
      };
      const action: InvoiceAction = { type: 'CLEAR_ERRORS' };
      const next = invoiceReducer(stateWithErrors, action);
      expect(next.errors).toEqual({});
    });
  });

  describe('ADD_LINE_ITEM', () => {
    it('appends a line item', () => {
      const item = { id: 'abc-123', description: 'Widget', quantity: 2, rate: 10 };
      const action: InvoiceAction = { type: 'ADD_LINE_ITEM', payload: item };
      const next = invoiceReducer(baseState, action);
      expect(next.lineItems).toHaveLength(1);
      expect(next.lineItems[0]).toEqual(item);
    });
  });

  describe('REMOVE_LINE_ITEM', () => {
    it('removes the item with the matching id', () => {
      const stateWithItems: InvoiceState = {
        ...baseState,
        lineItems: [
          { id: 'id-1', description: 'A', quantity: 1, rate: 5 },
          { id: 'id-2', description: 'B', quantity: 2, rate: 10 },
        ],
      };
      const action: InvoiceAction = { type: 'REMOVE_LINE_ITEM', payload: { id: 'id-1' } };
      const next = invoiceReducer(stateWithItems, action);
      expect(next.lineItems).toHaveLength(1);
      expect(next.lineItems[0].id).toBe('id-2');
    });
  });

  describe('UPDATE_LINE_ITEM', () => {
    it('updates a field on the matching line item', () => {
      const stateWithItems: InvoiceState = {
        ...baseState,
        lineItems: [{ id: 'id-1', description: 'Old', quantity: 1, rate: 5 }],
      };
      const action: InvoiceAction = {
        type: 'UPDATE_LINE_ITEM',
        payload: { id: 'id-1', field: 'description', value: 'New' },
      };
      const next = invoiceReducer(stateWithItems, action);
      expect(next.lineItems[0].description).toBe('New');
    });

    it('does not affect other line items', () => {
      const stateWithItems: InvoiceState = {
        ...baseState,
        lineItems: [
          { id: 'id-1', description: 'A', quantity: 1, rate: 5 },
          { id: 'id-2', description: 'B', quantity: 2, rate: 10 },
        ],
      };
      const action: InvoiceAction = {
        type: 'UPDATE_LINE_ITEM',
        payload: { id: 'id-1', field: 'quantity', value: 99 },
      };
      const next = invoiceReducer(stateWithItems, action);
      expect(next.lineItems[0].quantity).toBe(99);
      expect(next.lineItems[1].quantity).toBe(2);
    });
  });
});
