import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { InvoiceProvider, useInvoice } from './InvoiceContext';
import { INVOICE_STORAGE_KEY } from './invoiceStorage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <InvoiceProvider>{children}</InvoiceProvider>
);

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InvoiceContext reducer', () => {
  it('SET_SENDER_NAME updates senderName', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'Acme Ltd' }));
    expect(result.current.state.senderName).toBe('Acme Ltd');
  });

  it('ADD_LINE_ITEM appends a new row', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const before = result.current.state.lineItems.length;
    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    expect(result.current.state.lineItems.length).toBe(before + 1);
  });

  it('REMOVE_LINE_ITEM removes the correct row', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    const idToRemove = result.current.state.lineItems[0].id;
    act(() => result.current.dispatch({ type: 'REMOVE_LINE_ITEM', payload: idToRemove }));
    expect(result.current.state.lineItems.find(li => li.id === idToRemove)).toBeUndefined();
  });

  it('REMOVE_LINE_ITEM keeps at least one row when removing the last item', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    // Start with exactly one item.
    expect(result.current.state.lineItems.length).toBe(1);
    const id = result.current.state.lineItems[0].id;
    act(() => result.current.dispatch({ type: 'REMOVE_LINE_ITEM', payload: id }));
    expect(result.current.state.lineItems.length).toBe(1);
  });

  it('RESET_INVOICE resets state and sets _lastAction to RESET_INVOICE', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'Test' }));
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(result.current.state.senderName).toBe('');
    expect(result.current.state._lastAction).toBe('RESET_INVOICE');
  });

  it('RESET_INVOICE computes issueDate at reset time (not stale)', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const before = result.current.state.issueDate;
    // Advance fake time by one day.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    vi.setSystemTime(tomorrow);
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    // issueDate should reflect the new "now", not the original render time.
    expect(result.current.state.issueDate).not.toBe(before);
    vi.useRealTimers();
  });
});

describe('InvoiceContext persistence', () => {
  it('saves state to localStorage on normal actions', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'Persist Me' }));
    const stored = localStorage.getItem(INVOICE_STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).senderName).toBe('Persist Me');
  });

  it('calls removeItem (not setItem) on RESET_INVOICE', () => {
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    const setSpy    = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'Temp' }));
    setSpy.mockClear();
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(removeSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);
    // setItem must NOT be called with the invoice key after reset.
    const invoiceSetCalls = setSpy.mock.calls.filter(([key]) => key === INVOICE_STORAGE_KEY);
    expect(invoiceSetCalls.length).toBe(0);
  });

  it('loads persisted state on mount', () => {
    localStorage.setItem(
      INVOICE_STORAGE_KEY,
      JSON.stringify({ senderName: 'Loaded', _lastAction: '' }),
    );
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.senderName).toBe('Loaded');
  });
});
