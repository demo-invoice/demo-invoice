/**
 * InvoiceContext — global state for the invoice application.
 *
 * Defines InvoiceState, a fully-typed discriminated action union,
 * the reducer with explicit switch cases, and the React context + provider.
 *
 * localStorage keys (T11 rehydration contract):
 *   invoice_currency               — selected currency code
 *   invoice_custom_currency_symbol — custom symbol when currency === 'Other'
 */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface InvoiceState {
  currency: string;
  customCurrencySymbol: string;
}

const DEFAULT_STATE: InvoiceState = {
  currency: 'USD',
  customCurrencySymbol: '',
};

// ---------------------------------------------------------------------------
// Action union
// ---------------------------------------------------------------------------

export type InvoiceAction =
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_CUSTOM_CURRENCY_SYMBOL'; payload: string };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer for InvoiceState.
 * customSymbol is sliced to 4 chars here as a second enforcement layer
 * beyond the HTML maxLength attribute on the input.
 */
export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'SET_CUSTOM_CURRENCY_SYMBOL':
      return { ...state, customCurrencySymbol: action.payload.slice(0, 4) };
    default: {
      // Exhaustiveness check — TypeScript will error if a case is missing.
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface InvoiceContextValue {
  state: InvoiceState;
  dispatch: React.Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/** Wraps the application and provides InvoiceContext to all descendants. */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, DEFAULT_STATE);

  /**
   * T11 wire-up: persist currency keys to localStorage on every change.
   * T11 owns the read/rehydrate side.
   */
  useEffect(() => {
    localStorage.setItem('invoice_currency', state.currency);
    localStorage.setItem(
      'invoice_custom_currency_symbol',
      state.customCurrencySymbol,
    );
  }, [state.currency, state.customCurrencySymbol]);

  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Consume InvoiceContext.
 * Throws if used outside of InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
