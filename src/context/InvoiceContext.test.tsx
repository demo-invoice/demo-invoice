import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  InvoiceProvider,
  useInvoice,
  makeDefaultState,
  invoiceReducer,
  INVOICE_STORAGE_KEY,
} from './InvoiceContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wrapper({ children }: { children: ReactNode }) {
  return <InvoiceProvider>{children}</InvoiceProvider>;
}

// ---------------------------------------------------------------------------
// makeDefaultState
// ---------------------------------------------------------------------------

describe('makeDefaultState', () => {
  it('returns today\'s date as issueDate', () => {
    const expected = new Date().toISOString().slice(0, 10);
    expect(makeDefaultState().issueDate).toBe(expected);
  });

  it('starts with _persistVersion 0', () => {
    expect(makeDefaultState()._persistVersion).toBe(0);
  });

  it('starts with _lastAction RESET_INVOICE', () => {
    expect(makeDefaultState()._lastAction).toBe('RESET_INVOICE');
  });

  it('starts with null logoDataUrl', () => {
    expect(makeDefaultState().logoDataUrl).toBeNull();
  });

  it('starts with empty lineItems array', () => {
    expect(makeDefaultState().lineItems).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Reducer — _persistVersion and _lastAction behaviour
// ---------------------------------------------------------------------------

describe('invoiceReducer _persistVersion', () => {
  it('increments _persistVersion on SET_LOGO', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, { type: 'SET_LOGO', payload: 'data:image/png;base64,abc' });
    expect(s1._persistVersion).toBe(1);
  });

  it('sets _lastAction to SET_LOGO on SET_LOGO', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, { type: 'SET_LOGO', payload: 'data:image/png;base64,abc' });
    expect(s1._lastAction).toBe('SET_LOGO');
  });

  it('does NOT increment _persistVersion on RESET_INVOICE', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, { type: 'SET_LOGO', payload: 'data:image/png;base64,abc' });
    // version is now 1; reset should go back to 0
    const s2 = invoiceReducer(s1, { type: 'RESET_INVOICE' });
    expect(s2._persistVersion).toBe(0);
  });

  it('sets _lastAction to RESET_INVOICE on RESET_INVOICE', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, { type: 'SET_LOGO', payload: 'data:image/png;base64,abc' });
    const s2 = invoiceReducer(s1, { type: 'RESET_INVOICE' });
    expect(s2._lastAction).toBe('RESET_INVOICE');
  });

  it('increments _persistVersion on ADD_LINE_ITEM', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, {
      type: 'ADD_LINE_ITEM',
      payload: { id: '1', description: 'Widget', quantity: 1, unitPrice: 10 },
    });
    expect(s1._persistVersion).toBe(1);
    expect(s1._lastAction).toBe('ADD_LINE_ITEM');
  });

  it('increments _persistVersion on UPDATE_LINE_ITEM', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, {
      type: 'ADD_LINE_ITEM',
      payload: { id: '1', description: 'Widget', quantity: 1, unitPrice: 10 },
    });
    const s2 = invoiceReducer(s1, {
      type: 'UPDATE_LINE_ITEM',
      payload: { id: '1', description: 'Widget Pro', quantity: 2, unitPrice: 20 },
    });
    expect(s2._persistVersion).toBe(2);
    expect(s2._lastAction).toBe('UPDATE_LINE_ITEM');
  });

  it('increments _persistVersion on REMOVE_LINE_ITEM', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, {
      type: 'ADD_LINE_ITEM',
      payload: { id: '1', description: 'Widget', quantity: 1, unitPrice: 10 },
    });
    const s2 = invoiceReducer(s1, { type: 'REMOVE_LINE_ITEM', payload: '1' });
    expect(s2._persistVersion).toBe(2);
    expect(s2._lastAction).toBe('REMOVE_LINE_ITEM');
    expect(s2.lineItems).toHaveLength(0);
  });

  it('RESET_INVOICE restores issueDate to today (called at dispatch time)', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, { type: 'SET_LOGO', payload: 'data:image/png;base64,abc' });
    const s2 = invoiceReducer(s1, { type: 'RESET_INVOICE' });
    const today = new Date().toISOString().slice(0, 10);
    expect(s2.issueDate).toBe(today);
  });
});

// ---------------------------------------------------------------------------
// Persistence effect — localStorage spy
// ---------------------------------------------------------------------------

describe('InvoiceProvider persistence', () => {
  let setItemSpy: ReturnType<typeof vi.spyOn>;
  let removeItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('calls localStorage.setItem exactly once when logo is uploaded (AC 7: no extra write)', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'SET_LOGO',
        payload: 'data:image/png;base64,iVBORw0KGgo=',
      });
    });

    const invoiceCalls = setItemSpy.mock.calls.filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    );
    // Must be exactly once — not twice — thanks to [_persistVersion, _lastAction] dep array.
    expect(invoiceCalls).toHaveLength(1);
  });

  it('does not call setItem when state.logo changes but _persistVersion already counted it', () => {
    // This test verifies the dep array is [_persistVersion, _lastAction], not [state].
    // Dispatching SET_LOGO once should produce exactly 1 setItem call, not 2.
    const { result } = renderHook(() => useInvoice(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'SET_LOGO',
        payload: 'data:image/png;base64,AAAA',
      });
    });

    const count = setItemSpy.mock.calls.filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    ).length;
    expect(count).toBe(1);
  });

  it('calls localStorage.removeItem (not setItem) on RESET_INVOICE', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });

    // First set some state so there is something to reset.
    act(() => {
      result.current.dispatch({
        type: 'SET_LOGO',
        payload: 'data:image/png;base64,iVBORw0KGgo=',
      });
    });

    const setCallsBefore = setItemSpy.mock.calls.filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    ).length;

    act(() => {
      result.current.dispatch({ type: 'RESET_INVOICE' });
    });

    // No additional setItem calls after reset.
    const setCallsAfter = setItemSpy.mock.calls.filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    ).length;
    expect(setCallsAfter).toBe(setCallsBefore);

    // removeItem must have been called with the correct key.
    const removeCalls = removeItemSpy.mock.calls.filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    );
    expect(removeCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('does not write {} to storage on RESET_INVOICE', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'RESET_INVOICE' });
    });

    const emptyObjectCalls = setItemSpy.mock.calls.filter(
      ([key, value]) => key === INVOICE_STORAGE_KEY && value === '{}',
    );
    expect(emptyObjectCalls).toHaveLength(0);
  });
});
