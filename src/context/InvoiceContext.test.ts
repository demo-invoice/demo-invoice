/**
 * InvoiceContext reducer unit tests.
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

  it('UPDATE_LINE_ITEM updates the correct field', () => {
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

  it('UPDATE_FIELD updates a top-level field', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'UPDATE_FIELD',
        payload: { field: 'clientName', value: 'Acme Corp' },
      }),
    );
    expect(result.current.state.clientName).toBe('Acme Corp');
  });

  it('SET_ERRORS stores error map', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'SET_ERRORS',
        payload: { invoiceNumber: 'Required' },
      }),
    );
    expect(result.current.state.errors['invoiceNumber']).toBe('Required');
  });

  it('CLEAR_ERRORS empties the error map', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'SET_ERRORS',
        payload: { invoiceNumber: 'Required' },
      }),
    );
    act(() => result.current.dispatch({ type: 'CLEAR_ERRORS' }));
    expect(result.current.state.errors).toEqual({});
  });
});
