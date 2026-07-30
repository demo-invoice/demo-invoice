import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { InvoiceProvider, useInvoice } from './InvoiceContext';

/** JSX wrapper using createElement to avoid needing JSX transform in .ts files. */
const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(InvoiceProvider, null, children);

describe('useInvoice / invoiceReducer', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.clientName).toBe('');
    expect(result.current.state.lineItems).toHaveLength(1);
    expect(result.current.state.errors).toEqual({});
  });

  it('SET_FIELD updates clientName', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_FIELD', field: 'clientName', value: 'Acme Corp' });
    });
    expect(result.current.state.clientName).toBe('Acme Corp');
  });

  it('ADD_LINE_ITEM appends a new item', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'ADD_LINE_ITEM' });
    });
    expect(result.current.state.lineItems).toHaveLength(2);
  });

  it('REMOVE_LINE_ITEM removes the correct item', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const id = result.current.state.lineItems[0].id;
    act(() => {
      result.current.dispatch({ type: 'REMOVE_LINE_ITEM', id });
    });
    expect(result.current.state.lineItems).toHaveLength(0);
  });

  it('UPDATE_LINE_ITEM updates the correct field', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const id = result.current.state.lineItems[0].id;
    act(() => {
      result.current.dispatch({ type: 'UPDATE_LINE_ITEM', id, field: 'description', value: 'Widget' });
    });
    expect(result.current.state.lineItems[0].description).toBe('Widget');
  });

  it('SET_ERRORS stores errors', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ERRORS', errors: { clientName: 'Required' } });
    });
    expect(result.current.state.errors['clientName']).toBe('Required');
  });

  it('CLEAR_ERRORS empties the errors map', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ERRORS', errors: { clientName: 'Required' } });
    });
    act(() => {
      result.current.dispatch({ type: 'CLEAR_ERRORS' });
    });
    expect(result.current.state.errors).toEqual({});
  });

  it('CLEAR_ERRORS then SET_ERRORS re-sets errors (double-submit pattern)', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ERRORS', errors: { clientName: 'Required' } });
    });
    act(() => {
      result.current.dispatch({ type: 'CLEAR_ERRORS' });
      result.current.dispatch({ type: 'SET_ERRORS', errors: { clientName: 'Required' } });
    });
    expect(result.current.state.errors['clientName']).toBe('Required');
  });

  it('throws when used outside InvoiceProvider', () => {
    // Suppress React's error boundary console output in test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useInvoice())).toThrow(
      'useInvoice must be used within an InvoiceProvider',
    );
    spy.mockRestore();
  });
});
