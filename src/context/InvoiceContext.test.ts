/**
 * InvoiceContext reducer — T17 unit tests.
 * Verifies every action type in the discriminated union.
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { InvoiceProvider, useInvoice } from './InvoiceContext';

function wrapper({ children }: { children: ReactNode }) {
  return InvoiceProvider({ children });
}

describe('InvoiceContext reducer', () => {
  it('ADD_LINE_ITEM appends a new row', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const before = result.current.state.lineItems.length;
    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    expect(result.current.state.lineItems.length).toBe(before + 1);
  });

  it('REMOVE_LINE_ITEM removes the correct row by id', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    const idToRemove = result.current.state.lineItems[0].id;
    act(() =>
      result.current.dispatch({ type: 'REMOVE_LINE_ITEM', payload: { id: idToRemove } }),
    );
    expect(result.current.state.lineItems.find((i) => i.id === idToRemove)).toBeUndefined();
  });

  it('UPDATE_LINE_ITEM updates the description field', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const id = result.current.state.lineItems[0].id;
    act(() =>
      result.current.dispatch({
        type: 'UPDATE_LINE_ITEM',
        payload: { id, field: 'description', value: 'Widget' },
      }),
    );
    expect(result.current.state.lineItems[0].description).toBe('Widget');
  });

  it('UPDATE_LINE_ITEM updates the quantity field', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const id = result.current.state.lineItems[0].id;
    act(() =>
      result.current.dispatch({
        type: 'UPDATE_LINE_ITEM',
        payload: { id, field: 'quantity', value: '5' },
      }),
    );
    expect(result.current.state.lineItems[0].quantity).toBe('5');
  });

  it('UPDATE_LINE_ITEM updates the unitPrice field', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const id = result.current.state.lineItems[0].id;
    act(() =>
      result.current.dispatch({
        type: 'UPDATE_LINE_ITEM',
        payload: { id, field: 'unitPrice', value: '9.99' },
      }),
    );
    expect(result.current.state.lineItems[0].unitPrice).toBe('9.99');
  });

  it('UPDATE_FIELD updates clientName', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'UPDATE_FIELD',
        payload: { field: 'clientName', value: 'Acme Corp' },
      }),
    );
    expect(result.current.state.clientName).toBe('Acme Corp');
  });

  it('UPDATE_FIELD updates invoiceNumber', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'UPDATE_FIELD',
        payload: { field: 'invoiceNumber', value: 'INV-001' },
      }),
    );
    expect(result.current.state.invoiceNumber).toBe('INV-001');
  });

  it('UPDATE_FIELD updates currency', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'UPDATE_FIELD',
        payload: { field: 'currency', value: 'EUR' },
      }),
    );
    expect(result.current.state.currency).toBe('EUR');
  });

  it('SET_ERRORS stores the error map', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'SET_ERRORS',
        payload: { invoiceNumber: 'Invoice number is required.' },
      }),
    );
    expect(result.current.state.errors['invoiceNumber']).toBe('Invoice number is required.');
  });

  it('SET_ERRORS stores multiple errors simultaneously', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'SET_ERRORS',
        payload: {
          invoiceNumber: 'Invoice number is required.',
          clientName: 'Client name is required.',
        },
      }),
    );
    expect(result.current.state.errors['invoiceNumber']).toBe('Invoice number is required.');
    expect(result.current.state.errors['clientName']).toBe('Client name is required.');
  });

  it('CLEAR_ERRORS empties the error map', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'SET_ERRORS',
        payload: { invoiceNumber: 'Invoice number is required.' },
      }),
    );
    act(() => result.current.dispatch({ type: 'CLEAR_ERRORS' }));
    expect(result.current.state.errors).toEqual({});
  });

  it('initial state has one line item', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.lineItems).toHaveLength(1);
  });

  it('initial state has currency USD', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.currency).toBe('USD');
  });

  it('initial state has empty errors', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.errors).toEqual({});
  });

  it('useInvoice throws when used outside InvoiceProvider', () => {
    expect(() => renderHook(() => useInvoice())).toThrow(
      'useInvoice must be used within an InvoiceProvider',
    );
  });
});
