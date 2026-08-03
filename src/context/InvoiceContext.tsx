import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { Dispatch } from 'react';
import { invoiceReducer, initialState, buildDefaultActive } from '../reducers/invoiceReducer';
import type { InvoiceAction, InvoiceState, ActiveInvoice, SavedInvoice } from '../types/invoice';
import { INVOICE_ACTIVE_KEY, INVOICE_HISTORY_KEY } from '../constants/storage';

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

/** Safely read and parse a value from localStorage. Returns null on any failure. */
function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Safely write a value to localStorage. Silently ignores errors (e.g. private browsing). */
function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore — storage unavailable (private browsing / quota exceeded).
  }
}

// ---------------------------------------------------------------------------
// Hydrate initial state from localStorage
// ---------------------------------------------------------------------------

function hydrateInitialState(): InvoiceState {
  const active = readStorage<ActiveInvoice>(INVOICE_ACTIVE_KEY);
  const savedInvoices = readStorage<SavedInvoice[]>(INVOICE_HISTORY_KEY);
  return {
    active: active ?? buildDefaultActive(),
    savedInvoices: savedInvoices ?? [],
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface InvoiceContextValue {
  state: InvoiceState;
  /** Raw dispatch from useReducer — no useCallback wrapper. */
  dispatch: Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/**
 * Provides invoice state and raw dispatch to the component tree.
 * Persists active invoice and history to localStorage on every state change.
 */
export function InvoiceProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, hydrateInitialState);

  // Persist active invoice.
  useEffect(() => {
    writeStorage(INVOICE_ACTIVE_KEY, state.active);
  }, [state.active]);

  // Persist saved invoices history.
  useEffect(() => {
    writeStorage(INVOICE_HISTORY_KEY, state.savedInvoices);
  }, [state.savedInvoices]);

  // dispatch is the raw stable reference from useReducer — no useCallback wrapper.
  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Hook to consume invoice context.
 * Throws if used outside of InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (ctx === null) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
