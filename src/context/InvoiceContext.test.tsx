// vi is imported explicitly — vitest globals are disabled (globals: false in vite.config.ts)
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { InvoiceProvider, useInvoice } from './InvoiceContext';

/** JSX wrapper for renderHook — must be .tsx to support JSX syntax. */
const wrapper = ({ children }: { children: ReactNode }) => (
  <InvoiceProvider>{children}</InvoiceProvider>
);

describe('InvoiceContext', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.clientName).toBe('');
    expect(result.current.state.notes).toBe('');
    expect(result.current.state.currency).toBe('USD');
    expect(result.current.state.lineItems).toEqual([]);
    expect(result.current.state.errors).toEqual([]);
  });

  it('SET_FIELD updates clientName', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_FIELD', field: 'clientName', value: 'Acme Corp' });
    });
    expect(result.current.state.clientName).toBe('Acme Corp');
  });

  it('SET_FIELD updates notes', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_FIELD', field: 'notes', value: 'Net 30' });
    });
    expect(result.current.state.notes).toBe('Net 30');
  });

  it('SET_FIELD updates currency', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_FIELD', field: 'currency', value: 'EUR' });
    });
    expect(result.current.state.currency).toBe('EUR');
  });

  it('SET_ERRORS sets errors array', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ERRORS', errors: ['Client name is required'] });
    });
    expect(result.current.state.errors).toEqual(['Client name is required']);
  });

  it('CLEAR_ERRORS empties errors array', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ERRORS', errors: ['Some error'] });
    });
    act(() => {
      result.current.dispatch({ type: 'CLEAR_ERRORS' });
    });
    expect(result.current.state.errors).toEqual([]);
  });

  it('ADD_LINE_ITEM adds a line item', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'ADD_LINE_ITEM' });
    });
    expect(result.current.state.lineItems).toHaveLength(1);
    expect(result.current.state.lineItems[0].description).toBe('');
    expect(result.current.state.lineItems[0].quantity).toBe(1);
    expect(result.current.state.lineItems[0].rate).toBe(0);
  });

  it('REMOVE_LINE_ITEM removes the correct item', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'ADD_LINE_ITEM' });
      result.current.dispatch({ type: 'ADD_LINE_ITEM' });
    });
    const idToRemove = result.current.state.lineItems[0].id;
    act(() => {
      result.current.dispatch({ type: 'REMOVE_LINE_ITEM', id: idToRemove });
    });
    expect(result.current.state.lineItems).toHaveLength(1);
    expect(result.current.state.lineItems[0].id).not.toBe(idToRemove);
  });

  it('UPDATE_LINE_ITEM updates the correct field', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'ADD_LINE_ITEM' });
    });
    const id = result.current.state.lineItems[0].id;
    act(() => {
      result.current.dispatch({ type: 'UPDATE_LINE_ITEM', id, field: 'description', value: 'Widget' });
    });
    expect(result.current.state.lineItems[0].description).toBe('Widget');
  });

  it('useInvoice throws outside provider', () => {
    // Suppress React error boundary noise
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useInvoice())).toThrow(
      'useInvoice must be used within an InvoiceProvider'
    );
    spy.mockRestore();
  });
});
