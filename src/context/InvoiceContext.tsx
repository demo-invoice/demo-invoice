import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type {
  InvoiceAction,
  InvoiceState,
  LineItem,
} from '../types/invoice';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const makeLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  unitPrice: 0,
});

const initialState: InvoiceState = {
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  sender: { name: '', email: '', address: '' },
  client: { name: '', email: '', address: '' },
  lineItems: [makeLineItem()],
  taxRate: 0,
  notes: '',
  logo: '',
  logoMime: '',
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer for invoice state. Only handles typed InvoiceAction variants.
 */
function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };

    case 'UPDATE_SENDER':
      return { ...state, sender: { ...state.sender, [action.field]: action.value } };

    case 'UPDATE_CLIENT':
      return { ...state, client: { ...state.client, [action.field]: action.value } };

    case 'ADD_LINE_ITEM':
      return { ...state, lineItems: [...state.lineItems, makeLineItem()] };

    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.id),
      };

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.id ? { ...item, [action.field]: action.value } : item
        ),
      };

    case 'SET_LOGO':
      return { ...state, logo: action.dataUrl, logoMime: action.mime };

    case 'RESET':
      return { ...initialState, lineItems: [makeLineItem()] };

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

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/**
 * Provides invoice state and dispatch to the component tree.
 */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);
  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Consumes InvoiceContext. Throws if used outside InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
