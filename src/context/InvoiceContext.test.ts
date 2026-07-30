import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useInvoice, InvoiceProvider } from './InvoiceContext';
import React from 'react';

describe('InvoiceContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(InvoiceProvider, null, children);

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
      result.current.dispatch({ type: 'ADD_LINE_ITEM' });
    });
    act(() => {
      result.current.dispatch({ type: 'REMOVE_LINE_ITEM', id });
    });
    expect(result.current.state.lineItems).toHaveLength(1);
    expect(result.current.state.lineItems[0].id).not.toBe(id);
  });

  it('UPDATE_LINE_ITEM updates the correct field', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const id = result.current.state.lineItems[0].id;
    act(() => {
      result.current.dispatch({ type: 'UPDATE_LINE_ITEM', id, field: 'description', value: 'Widget' });
    });
    expect(result.current.state.lineItems[0].description).toBe('Widget');
  });

  it('SET_ERRORS sets errors', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ERRORS', errors: { clientName: 'Required' } });
    });
    expect(result.current.state.errors.clientName).toBe('Required');
  });

  it('CLEAR_ERRORS clears errors', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ERRORS', errors: { clientName: 'Required' } });
    });
    act(() => {
      result.current.dispatch({ type: 'CLEAR_ERRORS' });
    });
    expect(result.current.state.errors).toEqual({});
  });

  it('useInvoice throws outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useInvoice())).toThrow('useInvoice must be used within an InvoiceProvider');
    spy.mockRestore();
  });
});
