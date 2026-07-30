import { describe, it, expect } from 'vitest';
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
    it('updates invoiceNumber', () => {
      const action: InvoiceAction = {
        type: 'SET_FIELD',
        payload: { field: 'invoiceNumber', value: 'INV-001' },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.invoiceNumber).toBe('INV-001');
    });

    it('updates clientName', () => {
      const action: InvoiceAction = {
        type: 'SET_FIELD',
        payload: { field: 'clientName', value: 'Acme Corp' },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.clientName).toBe('Acme Corp');
    });

    it('updates issueDate', () => {
      const action: InvoiceAction = {
        type: 'SET_FIELD',
        payload: { field: 'issueDate', value: '2024-01-01' },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.issueDate).toBe('2024-01-01');
    });

    it('updates dueDate', () => {
      const action: InvoiceAction = {
        type: 'SET_FIELD',
        payload: { field: 'dueDate', value: '2024-01-31' },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.dueDate).toBe('2024-01-31');
    });

    it('updates currency', () => {
      const action: InvoiceAction = {
        type: 'SET_FIELD',
        payload: { field: 'currency', value: 'EUR' },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.currency).toBe('EUR');
    });

    it('does not mutate other fields', () => {
      const action: InvoiceAction = {
        type: 'SET_FIELD',
        payload: { field: 'clientName', value: 'Acme Corp' },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.invoiceNumber).toBe('');
      expect(next.currency).toBe('USD');
      expect(next.lineItems).toHaveLength(0);
    });

    it('returns a new state object (immutability)', () => {
      const action: InvoiceAction = {
        type: 'SET_FIELD',
        payload: { field: 'notes', value: 'Some notes' },
      };
      const next = invoiceReducer(baseState, action);
      expect(next).not.toBe(baseState);
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

    it('sets multiple field errors at once', () => {
      const action: InvoiceAction = {
        type: 'SET_ERRORS',
        payload: {
          invoiceNumber: ['Invoice number is required.'],
          clientName: ['Client name is required.'],
        },
      };
      const next = invoiceReducer(baseState, action);
      expect(next.errors['invoiceNumber']).toEqual(['Invoice number is required.']);
      expect(next.errors['clientName']).toEqual(['Client name is required.']);
    });

    it('replaces existing errors entirely', () => {
      const stateWithErrors: InvoiceState = {
        ...baseState,
        errors: { notes: ['Too long'] },
      };
      const action: InvoiceAction = {
        type: 'SET_ERRORS',
        payload: { invoiceNumber: ['Required'] },
      };
      const next = invoiceReducer(stateWithErrors, action);
      expect(next.errors['notes']).toBeUndefined();
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

    it('is a no-op when errors are already empty', () => {
      const action: InvoiceAction = { type: 'CLEAR_ERRORS' };
      const next = invoiceReducer(baseState, action);
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

    it('appends multiple items in order', () => {
      const item1 = { id: 'id-1', description: 'A', quantity: 1, rate: 5 };
      const item2 = { id: 'id-2', description: 'B', quantity: 2, rate: 10 };
      const s1 = invoiceReducer(baseState, { type: 'ADD_LINE_ITEM', payload: item1 });
      const s2 = invoiceReducer(s1, { type: 'ADD_LINE_ITEM', payload: item2 });
      expect(s2.lineItems).toHaveLength(2);
      expect(s2.lineItems[0].id).toBe('id-1');
      expect(s2.lineItems[1].id).toBe('id-2');
    });

    it('does not mutate existing lineItems array', () => {
      const item = { id: 'abc-123', description: 'Widget', quantity: 2, rate: 10 };
      const action: InvoiceAction = { type: 'ADD_LINE_ITEM', payload: item };
      const next = invoiceReducer(baseState, action);
      expect(next.lineItems).not.toBe(baseState.lineItems);
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

    it('is a no-op when id does not exist', () => {
      const stateWithItems: InvoiceState = {
        ...baseState,
        lineItems: [{ id: 'id-1', description: 'A', quantity: 1, rate: 5 }],
      };
      const action: InvoiceAction = { type: 'REMOVE_LINE_ITEM', payload: { id: 'no-such-id' } };
      const next = invoiceReducer(stateWithItems, action);
      expect(next.lineItems).toHaveLength(1);
    });
  });

  describe('UPDATE_LINE_ITEM', () => {
    it('updates description on the matching line item', () => {
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

    it('updates quantity on the matching line item', () => {
      const stateWithItems: InvoiceState = {
        ...baseState,
        lineItems: [{ id: 'id-1', description: 'A', quantity: 1, rate: 5 }],
      };
      const action: InvoiceAction = {
        type: 'UPDATE_LINE_ITEM',
        payload: { id: 'id-1', field: 'quantity', value: 99 },
      };
      const next = invoiceReducer(stateWithItems, action);
      expect(next.lineItems[0].quantity).toBe(99);
    });

    it('updates rate on the matching line item', () => {
      const stateWithItems: InvoiceState = {
        ...baseState,
        lineItems: [{ id: 'id-1', description: 'A', quantity: 1, rate: 5 }],
      };
      const action: InvoiceAction = {
        type: 'UPDATE_LINE_ITEM',
        payload: { id: 'id-1', field: 'rate', value: 49.99 },
      };
      const next = invoiceReducer(stateWithItems, action);
      expect(next.lineItems[0].rate).toBe(49.99);
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

    it('is a no-op when id does not exist', () => {
      const stateWithItems: InvoiceState = {
        ...baseState,
        lineItems: [{ id: 'id-1', description: 'A', quantity: 1, rate: 5 }],
      };
      const action: InvoiceAction = {
        type: 'UPDATE_LINE_ITEM',
        payload: { id: 'no-such-id', field: 'description', value: 'X' },
      };
      const next = invoiceReducer(stateWithItems, action);
      expect(next.lineItems[0].description).toBe('A');
    });
  });
});
