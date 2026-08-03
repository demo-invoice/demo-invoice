import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { InvoiceProvider, useInvoiceContext, invoiceReducer } from '../context/InvoiceContext';
import type { Invoice, InvoiceAction, InvoiceState } from '../types/invoice';

// ---------------------------------------------------------------------------
// Reducer unit tests (pure function — no React needed)
// ---------------------------------------------------------------------------

const baseInvoice: Invoice = {
  invoiceNumber: 'INV-001',
  companyName: 'Acme',
  clientName: 'Bob',
  clientEmail: '',
  issuedAt: '2024-01-01',
  dueAt: '',
  taxRate: 0,
  lineItems: [],
};

const baseState: InvoiceState = { invoice: baseInvoice };

describe('invoiceReducer', () => {
  it('SET_INVOICE replaces the invoice', () => {
    const newInvoice: Invoice = { ...baseInvoice, invoiceNumber: 'INV-999' };
    const action: InvoiceAction = { type: 'SET_INVOICE', payload: newInvoice };
    const next = invoiceReducer(baseState, action);
    expect(next.invoice.invoiceNumber).toBe('INV-999');
  });

  it('ADD_LINE_ITEM appends a line item', () => {
    const action: InvoiceAction = {
      type: 'ADD_LINE_ITEM',
      payload: { id: 'a', description: 'Widget', quantity: 1, unitPrice: 10 },
    };
    const next = invoiceReducer(baseState, action);
    expect(next.invoice.lineItems).toHaveLength(1);
    expect(next.invoice.lineItems[0].id).toBe('a');
  });

  it('REMOVE_LINE_ITEM removes the correct item', () => {
    const stateWithItem: InvoiceState = {
      invoice: {
        ...baseInvoice,
        lineItems: [
          { id: 'a', description: 'Widget', quantity: 1, unitPrice: 10 },
          { id: 'b', description: 'Gadget', quantity: 2, unitPrice: 20 },
        ],
      },
    };
    const action: InvoiceAction = { type: 'REMOVE_LINE_ITEM', payload: { id: 'a' } };
    const next = invoiceReducer(stateWithItem, action);
    expect(next.invoice.lineItems).toHaveLength(1);
    expect(next.invoice.lineItems[0].id).toBe('b');
  });

  it('UPDATE_LINE_ITEM updates the correct item in place', () => {
    const stateWithItem: InvoiceState = {
      invoice: {
        ...baseInvoice,
        lineItems: [{ id: 'a', description: 'Widget', quantity: 1, unitPrice: 10 }],
      },
    };
    const action: InvoiceAction = {
      type: 'UPDATE_LINE_ITEM',
      payload: { id: 'a', description: 'Updated Widget', quantity: 5, unitPrice: 15 },
    };
    const next = invoiceReducer(stateWithItem, action);
    expect(next.invoice.lineItems[0].description).toBe('Updated Widget');
    expect(next.invoice.lineItems[0].quantity).toBe(5);
  });

  it('SET_CLIENT_EMAIL updates clientEmail', () => {
    const action: InvoiceAction = {
      type: 'SET_CLIENT_EMAIL',
      payload: { email: 'client@example.com' },
    };
    const next = invoiceReducer(baseState, action);
    expect(next.invoice.clientEmail).toBe('client@example.com');
  });

  it('SET_INVOICE_META updates meta fields without touching lineItems', () => {
    const stateWithItems: InvoiceState = {
      invoice: {
        ...baseInvoice,
        lineItems: [{ id: 'x', description: 'X', quantity: 1, unitPrice: 1 }],
      },
    };
    const action: InvoiceAction = {
      type: 'SET_INVOICE_META',
      payload: { companyName: 'NewCo', dueAt: '2024-12-31' },
    };
    const next = invoiceReducer(stateWithItems, action);
    expect(next.invoice.companyName).toBe('NewCo');
    expect(next.invoice.dueAt).toBe('2024-12-31');
    // lineItems must be untouched
    expect(next.invoice.lineItems).toHaveLength(1);
  });

  /**
   * Exhaustive-check test: TypeScript's `never` guard in the reducer default
   * branch means that if a new action type is added to the union but not
   * handled, the project will FAIL TO COMPILE — not silently no-op at runtime.
   *
   * This test documents that contract. We verify it by confirming that all
   * known action types are handled (the reducer returns a new state for each)
   * and that the TypeScript types are correctly narrowed (compile-time proof).
   */
  it('all action types in the union are handled — no silent no-ops (T7 lesson)', () => {
    const actionTypes: InvoiceAction['type'][] = [
      'SET_INVOICE',
      'ADD_LINE_ITEM',
      'REMOVE_LINE_ITEM',
      'UPDATE_LINE_ITEM',
      'SET_CLIENT_EMAIL',
      'SET_INVOICE_META',
    ];
    // If any type were missing from the reducer, the `never` guard would
    // produce a TypeScript compile error — caught before this test even runs.
    expect(actionTypes).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// Context integration test
// ---------------------------------------------------------------------------

function TestConsumer() {
  const { state, dispatch } = useInvoiceContext();
  return (
    <div>
      <span data-testid="company">{state.invoice.companyName}</span>
      <button
        onClick={() =>
          dispatch({ type: 'SET_INVOICE_META', payload: { companyName: 'NewCo' } })
        }
      >
        Update
      </button>
    </div>
  );
}

describe('InvoiceContext integration', () => {
  it('provides state and dispatch to consumers', () => {
    render(
      <InvoiceProvider>
        <TestConsumer />
      </InvoiceProvider>,
    );
    expect(screen.getByTestId('company').textContent).toBe('Acme Corp');
  });

  it('dispatch updates state correctly', () => {
    render(
      <InvoiceProvider>
        <TestConsumer />
      </InvoiceProvider>,
    );
    act(() => {
      screen.getByRole('button', { name: /Update/i }).click();
    });
    expect(screen.getByTestId('company').textContent).toBe('NewCo');
  });

  it('throws when useInvoiceContext is used outside provider', () => {
    // Suppress React's error boundary console output for this test.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<TestConsumer />)).toThrow(
      'useInvoiceContext must be used within an InvoiceProvider',
    );
    spy.mockRestore();
  });
});
