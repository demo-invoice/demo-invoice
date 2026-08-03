import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
  InvoiceProvider,
  useInvoice,
  DEFAULT_INVOICE_STATE,
} from '../context/InvoiceContext';
import {
  loadActiveInvoice,
  loadInvoiceHistory,
  appendInvoiceHistory,
  INVOICE_HISTORY_KEY,
  INVOICE_STORAGE_KEY,
} from '../services/invoiceStorage';
import type { InvoiceState, InvoiceAction, SavedInvoiceEntry } from '../types/invoice';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <InvoiceProvider>{children}</InvoiceProvider>
);

const loadedState: InvoiceState = {
  invoiceNumber: 'INV-999',
  issueDate: '2024-06-01',
  dueDate: '2024-07-01',
  from: 'Loaded From',
  to: 'Loaded To',
  lineItems: [{ id: 'li-1', description: 'Widget', quantity: 2, unitPrice: 50 }],
};

const historyEntry: SavedInvoiceEntry = {
  id: 'hist-1',
  label: 'INV-OLD — 2023-12-01',
  savedAt: '2023-12-01T08:00:00.000Z',
  snapshot: {
    invoiceNumber: 'INV-OLD',
    issueDate: '2023-12-01',
    dueDate: '2023-12-31',
    from: 'Old Sender',
    to: 'Old Recipient',
    lineItems: [],
  },
};

beforeEach(() => {
  localStorage.clear();
});

// ─── Reducer action coverage ─────────────────────────────────────────────────

describe('InvoiceContext reducer', () => {
  it('LOAD_SAVED_INVOICE replaces entire state with payload', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'LOAD_SAVED_INVOICE', payload: loadedState });
    });
    expect(result.current.state).toEqual(loadedState);
  });

  it('LOAD_SAVED_INVOICE restores issueDate verbatim (not recomputed)', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'LOAD_SAVED_INVOICE', payload: loadedState });
    });
    expect(result.current.state.issueDate).toBe('2024-06-01');
  });

  it('LOAD_SAVED_INVOICE restores lineItems verbatim', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'LOAD_SAVED_INVOICE', payload: loadedState });
    });
    expect(result.current.state.lineItems).toEqual(loadedState.lineItems);
  });

  it('NEW_INVOICE resets state to DEFAULT_INVOICE_STATE', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'LOAD_SAVED_INVOICE', payload: loadedState });
    });
    act(() => {
      result.current.dispatch({ type: 'NEW_INVOICE' });
    });
    expect(result.current.state).toEqual(DEFAULT_INVOICE_STATE);
  });

  it('NEW_INVOICE does not touch INVOICE_HISTORY_KEY', () => {
    appendInvoiceHistory(historyEntry);
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'NEW_INVOICE' });
    });
    expect(localStorage.getItem(INVOICE_HISTORY_KEY)).not.toBeNull();
    expect(loadInvoiceHistory()).toHaveLength(1);
    expect(loadInvoiceHistory()[0].id).toBe('hist-1');
  });

  it('SET_INVOICE_NUMBER updates invoiceNumber', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_INVOICE_NUMBER', payload: 'INV-042' });
    });
    expect(result.current.state.invoiceNumber).toBe('INV-042');
  });

  it('SET_ISSUE_DATE updates issueDate', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ISSUE_DATE', payload: '2024-03-01' });
    });
    expect(result.current.state.issueDate).toBe('2024-03-01');
  });

  it('SET_DUE_DATE updates dueDate', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_DUE_DATE', payload: '2024-04-01' });
    });
    expect(result.current.state.dueDate).toBe('2024-04-01');
  });

  it('SET_FROM updates from', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_FROM', payload: 'New Sender' });
    });
    expect(result.current.state.from).toBe('New Sender');
  });

  it('SET_TO updates to', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_TO', payload: 'New Recipient' });
    });
    expect(result.current.state.to).toBe('New Recipient');
  });

  it('SET_LINE_ITEMS updates lineItems', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const items = [{ id: 'x1', description: 'Thing', quantity: 3, unitPrice: 10 }];
    act(() => {
      result.current.dispatch({ type: 'SET_LINE_ITEMS', payload: items });
    });
    expect(result.current.state.lineItems).toEqual(items);
  });
});

// ─── localStorage persistence via useEffect ──────────────────────────────────

describe('InvoiceContext localStorage persistence', () => {
  it('persists active invoice to localStorage after LOAD_SAVED_INVOICE', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'LOAD_SAVED_INVOICE', payload: loadedState });
    });
    const persisted = loadActiveInvoice();
    expect(persisted).toEqual(loadedState);
  });

  it('active invoice is not an empty object after LOAD_SAVED_INVOICE', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'LOAD_SAVED_INVOICE', payload: loadedState });
    });
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    expect(raw).not.toBe('{}');
    expect(raw).not.toBeNull();
  });

  it('initialises from localStorage on mount (simulated page reload)', () => {
    // Pre-seed localStorage as if a previous session saved state
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(loadedState));
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state).toEqual(loadedState);
  });

  it('starts with DEFAULT_INVOICE_STATE when localStorage is empty', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state).toEqual(DEFAULT_INVOICE_STATE);
  });

  it('starts with DEFAULT_INVOICE_STATE when localStorage contains malformed JSON', () => {
    localStorage.setItem(INVOICE_STORAGE_KEY, 'not-json');
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.state).toEqual(DEFAULT_INVOICE_STATE);
  });
});

// ─── TypeScript union membership (compile-time guard) ────────────────────────

describe('InvoiceAction union type', () => {
  it('LOAD_SAVED_INVOICE is a valid member of InvoiceAction (compile-time guard)', () => {
    const action: InvoiceAction = { type: 'LOAD_SAVED_INVOICE', payload: loadedState };
    expect(action.type).toBe('LOAD_SAVED_INVOICE');
  });
});
