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
});

// ---------------------------------------------------------------------------
// Reducer — _persistVersion behaviour
// ---------------------------------------------------------------------------

describe('invoiceReducer _persistVersion', () => {
  it('increments _persistVersion on SET_LOGO', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, { type: 'SET_LOGO', payload: 'data:image/png;base64,abc' });
    expect(s1._persistVersion).toBe(1);
  });

  it('does NOT increment _persistVersion on RESET_INVOICE', () => {
    const s0 = makeDefaultState();
    const s1 = invoiceReducer(s0, { type: 'SET_LOGO', payload: 'data:image/png;base64,abc' });
    // version is now 1; reset should go back to 0
    const s2 = invoiceReducer(s1, { type: 'RESET_INVOICE' });
    expect(s2._persistVersion).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Persistence effect — localStorage.setItem spy
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

  it('calls localStorage.setItem exactly once when logo is uploaded', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'SET_LOGO',
        payload: 'data:image/png;base64,iVBORw0KGgo=',
      });
    });

    // Should be called exactly once — not twice — thanks to _persistVersion dep array.
    const invoiceCalls = setItemSpy.mock.calls.filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    );
    expect(invoiceCalls).toHaveLength(1);
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

    // removeItem must have been called.
    const removeCalls = removeItemSpy.mock.calls.filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    );
    expect(removeCalls.length).toBeGreaterThanOrEqual(1);
  });
});
