/**
 * React context and reducer for the active invoice.
 */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import type { InvoiceState, InvoiceAction } from '../types/invoice';
import {
  loadActiveInvoice,
  saveActiveInvoice,
  clearActiveInvoice,
} from '../services/invoiceStorage';

export const DEFAULT_INVOICE_STATE: InvoiceState = {
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  from: '',
  to: '',
  lineItems: [],
};

function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'SET_INVOICE_NUMBER':
      return { ...state, invoiceNumber: action.payload };
    case 'SET_ISSUE_DATE':
      return { ...state, issueDate: action.payload };
    case 'SET_DUE_DATE':
      return { ...state, dueDate: action.payload };
    case 'SET_FROM':
      return { ...state, from: action.payload };
    case 'SET_TO':
      return { ...state, to: action.payload };
    case 'SET_LINE_ITEMS':
      return { ...state, lineItems: action.payload };
    case 'NEW_INVOICE':
      clearActiveInvoice();
      return { ...DEFAULT_INVOICE_STATE };
    case 'LOAD_SAVED_INVOICE':
      return { ...action.payload };
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}

interface InvoiceContextValue {
  state: InvoiceState;
  dispatch: React.Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/** Provider that initialises state from localStorage and persists on every change. */
export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    invoiceReducer,
    undefined,
    () => loadActiveInvoice() ?? { ...DEFAULT_INVOICE_STATE },
  );

  // Persist active invoice on every state change.
  // For LOAD_SAVED_INVOICE the reducer already returns the full snapshot;
  // this effect writes it to localStorage so it is never an empty object.
  useEffect(() => {
    saveActiveInvoice(state);
  }, [state]);

  const value = { state, dispatch };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Hook to access the invoice context.
 * Must be used inside InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
