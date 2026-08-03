/**
 * InvoiceContext — React context + useReducer with a fully typed action union.
 *
 * T7 lesson: ALL dispatched action types must exist in the reducer's typed
 * union. The exhaustive `never` check at the bottom of the reducer ensures
 * TypeScript will fail at compile time if a new action type is added to the
 * union but not handled — no silent runtime no-ops.
 */
import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type { Invoice, InvoiceAction, InvoiceState } from '../types/invoice';

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------

const DEFAULT_INVOICE: Invoice = {
  invoiceNumber: 'INV-001',
  companyName: 'Acme Corp',
  clientName: '',
  clientEmail: '',
  issuedAt: new Date().toISOString().slice(0, 10),
  dueAt: '',
  taxRate: 0,
  lineItems: [],
};

const initialState: InvoiceState = { invoice: DEFAULT_INVOICE };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer for invoice state.
 * Exhaustive switch — TypeScript `never` guard prevents silent no-ops.
 */
export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'SET_INVOICE':
      return { ...state, invoice: action.payload };

    case 'ADD_LINE_ITEM':
      return {
        ...state,
        invoice: {
          ...state.invoice,
          lineItems: [...state.invoice.lineItems, action.payload],
        },
      };

    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        invoice: {
          ...state.invoice,
          lineItems: state.invoice.lineItems.filter(
            (item) => item.id !== action.payload.id,
          ),
        },
      };

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        invoice: {
          ...state.invoice,
          lineItems: state.invoice.lineItems.map((item) =>
            item.id === action.payload.id ? action.payload : item,
          ),
        },
      };

    case 'SET_CLIENT_EMAIL':
      return {
        ...state,
        invoice: { ...state.invoice, clientEmail: action.payload.email },
      };

    case 'SET_INVOICE_META':
      return {
        ...state,
        invoice: { ...state.invoice, ...action.payload },
      };

    default: {
      // Exhaustive check: if TypeScript reaches here, a new action type was
      // added to the union but not handled — compile-time error, not a no-op.
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

/** Provider that wraps the app (or a subtree) with invoice state. */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);
  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Hook to consume InvoiceContext.
 * Throws if used outside of InvoiceProvider.
 */
export function useInvoiceContext(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoiceContext must be used within an InvoiceProvider');
  }
  return ctx;
}
