import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { InvoiceProvider, useInvoice } from './InvoiceContext';
import { INVOICE_STORAGE_KEY } from './invoiceStorage';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <InvoiceProvider>{children}</InvoiceProvider>
);

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Reducer behaviour
// ---------------------------------------------------------------------------

describe('InvoiceContext reducer', () => {
  it('SET_SENDER_NAME updates senderName', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'Acme Ltd' }));
    expect(result.current.state.senderName).toBe('Acme Ltd');
  });

  it('SET_SENDER_EMAIL updates senderEmail', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_EMAIL', payload: 'a@b.com' }));
    expect(result.current.state.senderEmail).toBe('a@b.com');
  });

  it('SET_SENDER_ADDRESS updates senderAddress', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_ADDRESS', payload: '1 Main St' }));
    expect(result.current.state.senderAddress).toBe('1 Main St');
  });

  it('SET_CLIENT_NAME updates clientName', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_CLIENT_NAME', payload: 'Client Co' }));
    expect(result.current.state.clientName).toBe('Client Co');
  });

  it('SET_CLIENT_EMAIL updates clientEmail', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_CLIENT_EMAIL', payload: 'c@d.com' }));
    expect(result.current.state.clientEmail).toBe('c@d.com');
  });

  it('SET_CLIENT_ADDRESS updates clientAddress', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_CLIENT_ADDRESS', payload: '2 Side Ave' }));
    expect(result.current.state.clientAddress).toBe('2 Side Ave');
  });

  it('SET_INVOICE_NUMBER updates invoiceNumber', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_INVOICE_NUMBER', payload: 'INV-001' }));
    expect(result.current.state.invoiceNumber).toBe('INV-001');
  });

  it('SET_ISSUE_DATE updates issueDate', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_ISSUE_DATE', payload: '2024-01-15' }));
    expect(result.current.state.issueDate).toBe('2024-01-15');
  });

  it('SET_DUE_DATE updates dueDate', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_DUE_DATE', payload: '2024-02-15' }));
    expect(result.current.state.dueDate).toBe('2024-02-15');
  });

  it('SET_TAX_RATE updates taxRate', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_TAX_RATE', payload: 15 }));
    expect(result.current.state.taxRate).toBe(15);
  });

  it('SET_LOGO updates logoDataUrl', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_LOGO', payload: 'data:image/png;base64,abc' }));
    expect(result.current.state.logoDataUrl).toBe('data:image/png;base64,abc');
  });

  it('SET_NOTES updates notes', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_NOTES', payload: 'Thank you!' }));
    expect(result.current.state.notes).toBe('Thank you!');
  });

  it('ADD_LINE_ITEM appends a new row', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const before = result.current.state.lineItems.length;
    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    expect(result.current.state.lineItems.length).toBe(before + 1);
  });

  it('ADD_LINE_ITEM new row has default quantity 1 and unitPrice 0', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    const last = result.current.state.lineItems.at(-1)!;
    expect(last.quantity).toBe(1);
    expect(last.unitPrice).toBe(0);
    expect(last.description).toBe('');
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
    expect(result.current.state.lineItems.length).toBe(1);
    const id = result.current.state.lineItems[0].id;
    act(() => result.current.dispatch({ type: 'REMOVE_LINE_ITEM', payload: id }));
    expect(result.current.state.lineItems.length).toBe(1);
  });

  it('UPDATE_LINE_ITEM updates the matching row', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const item = result.current.state.lineItems[0];
    const updated = { ...item, description: 'Widget', quantity: 3, unitPrice: 9.99 };
    act(() => result.current.dispatch({ type: 'UPDATE_LINE_ITEM', payload: updated }));
    const found = result.current.state.lineItems.find(li => li.id === item.id)!;
    expect(found.description).toBe('Widget');
    expect(found.quantity).toBe(3);
    expect(found.unitPrice).toBe(9.99);
  });

  it('each action sets _lastAction to the action type string', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'X' }));
    expect(result.current.state._lastAction).toBe('SET_SENDER_NAME');

    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    expect(result.current.state._lastAction).toBe('ADD_LINE_ITEM');

    act(() => result.current.dispatch({ type: 'SET_TAX_RATE', payload: 10 }));
    expect(result.current.state._lastAction).toBe('SET_TAX_RATE');
  });

  it('RESET_INVOICE resets senderName to empty string', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'Test' }));
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(result.current.state.senderName).toBe('');
  });

  it('RESET_INVOICE resets clientName to empty string', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_CLIENT_NAME', payload: 'Client' }));
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(result.current.state.clientName).toBe('');
  });

  it('RESET_INVOICE resets taxRate to 0', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_TAX_RATE', payload: 20 }));
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(result.current.state.taxRate).toBe(0);
  });

  it('RESET_INVOICE resets logoDataUrl to empty string', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_LOGO', payload: 'data:image/png;base64,xyz' }));
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(result.current.state.logoDataUrl).toBe('');
  });

  it('RESET_INVOICE sets _lastAction to RESET_INVOICE', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'Test' }));
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(result.current.state._lastAction).toBe('RESET_INVOICE');
  });

  it('RESET_INVOICE keeps exactly one line item', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(result.current.state.lineItems.length).toBe(1);
  });

  it('RESET_INVOICE computes issueDate at reset time, not stale app-load time', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const originalDate = result.current.state.issueDate;

    // Advance time by one day.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    vi.setSystemTime(tomorrow);

    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(result.current.state.issueDate).not.toBe(originalDate);
    expect(result.current.state.issueDate).toBe(tomorrow.toISOString().slice(0, 10));

    vi.useRealTimers();
  });

  it('RESET_INVOICE computes dueDate as 30 days after reset-time issueDate', () => {
    vi.useFakeTimers();
    const fixed = new Date('2025-06-01T12:00:00Z');
    vi.setSystemTime(fixed);

    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));

    const expectedDue = new Date(fixed);
    expectedDue.setDate(expectedDue.getDate() + 30);
    expect(result.current.state.dueDate).toBe(expectedDue.toISOString().slice(0, 10));

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// Persistence (localStorage) behaviour
// ---------------------------------------------------------------------------

describe('InvoiceContext persistence', () => {
  it('saves state to localStorage on normal actions', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'Persist Me' }));
    const stored = localStorage.getItem(INVOICE_STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).senderName).toBe('Persist Me');
  });

  it('does NOT write to localStorage when _lastAction is empty string (initial mount)', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    renderHook(() => useInvoice(), { wrapper });
    const invoiceSetCalls = setSpy.mock.calls.filter(([key]) => key === INVOICE_STORAGE_KEY);
    expect(invoiceSetCalls.length).toBe(0);
  });

  it('calls removeItem (not setItem) on RESET_INVOICE', () => {
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    const setSpy    = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useInvoice(), { wrapper });

    act(() => result.current.dispatch({ type: 'SET_SENDER_NAME', payload: 'Temp' }));
    setSpy.mockClear();

    act(() => result.current.dispatch({ type: 'RESET_INVOICE' }));
    expect(removeSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);

    const invoiceSetCalls = setSpy.mock.calls.filter(([key]) => key === INVOICE_STORAGE_KEY);
    expect(invoiceSetCalls.length).toBe(0);
  });

  it('loads persisted senderName from localStorage on mount', () => {
    localStorage.setItem(
      INVOICE_STORAGE_KEY,
      JSON.stringify({ senderName: 'Loaded', _lastAction: '' }),
    );
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.senderName).toBe('Loaded');
  });

  it('loads persisted taxRate from localStorage on mount', () => {
    localStorage.setItem(
      INVOICE_STORAGE_KEY,
      JSON.stringify({ taxRate: 18, _lastAction: '' }),
    );
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.taxRate).toBe(18);
  });

  it('returns default state when localStorage is empty', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.senderName).toBe('');
    expect(result.current.state.taxRate).toBe(0);
    expect(result.current.state.lineItems.length).toBe(1);
  });

  it('handles corrupt localStorage JSON gracefully (returns default state)', () => {
    localStorage.setItem(INVOICE_STORAGE_KEY, 'not-valid-json{{{');
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state.senderName).toBe('');
  });

  it('persists updated taxRate to localStorage', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'SET_TAX_RATE', payload: 7.5 }));
    const stored = localStorage.getItem(INVOICE_STORAGE_KEY);
    expect(JSON.parse(stored!).taxRate).toBe(7.5);
  });

  it('persists line items to localStorage after ADD_LINE_ITEM', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_LINE_ITEM' }));
    const stored = localStorage.getItem(INVOICE_STORAGE_KEY);
    expect(JSON.parse(stored!).lineItems.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// useInvoice guard
// ---------------------------------------------------------------------------

describe('useInvoice', () => {
  it('throws when used outside InvoiceProvider', () => {
    // Suppress React error boundary noise in test output.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useInvoice())).toThrow(
      'useInvoice must be used within an InvoiceProvider',
    );
    consoleSpy.mockRestore();
  });
});
