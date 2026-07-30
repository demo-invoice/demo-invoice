import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface InvoiceState {
  clientName: string;
  clientEmail: string;
  lineItems: LineItem[];
  errors: Record<string, string>;
}

export type InvoiceAction =
  | { type: 'SET_FIELD'; field: keyof Omit<InvoiceState, 'lineItems' | 'errors'>; value: string }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM'; id: string }
  | { type: 'UPDATE_LINE_ITEM'; id: string; field: keyof Omit<LineItem, 'id'>; value: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERRORS' };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  unitPrice: 0,
  currency: 'USD',
});

const initialState: InvoiceState = {
  clientName: '',
  clientEmail: '',
  lineItems: [initialLineItem()],
  errors: {},
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer for invoice state.
 * CLEAR_ERRORS always precedes SET_ERRORS in handleSubmit so that live
 * regions re-announce identical error messages on repeated submissions.
 */
export function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'ADD_LINE_ITEM':
      return { ...state, lineItems: [...state.lineItems, initialLineItem()] };

    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.id),
      };

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.id ? { ...item, [action.field]: action.value } : item,
        ),
      };

    case 'SET_ERRORS':
      return { ...state, errors: action.errors };

    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };

    default: {
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
  dispatch: Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/**
 * Provides invoice state and dispatch to the component subtree.
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
 * Hook to consume invoice context.
 * Throws if used outside InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
