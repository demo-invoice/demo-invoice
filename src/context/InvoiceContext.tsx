/**
 * InvoiceContext — React context + reducer for invoice state.
 *
 * The action union is exhaustive and discriminated so TypeScript strict mode
 * will reject any dispatch call that references an unknown action type.
 * Before adding new behaviour, extend the `InvoiceAction` union first.
 */
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface LineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export interface InvoiceState {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  currency: string;
  lineItems: LineItem[];
  errors: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Exhaustive typed action union — add here before dispatching a new type.
// ---------------------------------------------------------------------------

export type InvoiceAction =
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM'; payload: { id: string } }
  | {
      type: 'UPDATE_LINE_ITEM';
      payload: { id: string; field: keyof Omit<LineItem, 'id'>; value: string };
    }
  | {
      type: 'UPDATE_FIELD';
      payload: { field: keyof Omit<InvoiceState, 'lineItems' | 'errors'>; value: string };
    }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const makeLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: '',
  unitPrice: '',
});

const initialState: InvoiceState = {
  invoiceNumber: '',
  date: '',
  dueDate: '',
  clientName: '',
  currency: 'USD',
  lineItems: [makeLineItem()],
  errors: {},
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer for invoice state. Every case is exhaustively typed;
 * the default branch is a compile-time exhaustiveness check.
 */
function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'ADD_LINE_ITEM':
      return { ...state, lineItems: [...state.lineItems, makeLineItem()] };

    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.payload.id),
      };

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.payload.id
            ? { ...item, [action.payload.field]: action.payload.value }
            : item,
        ),
      };

    case 'UPDATE_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };

    case 'SET_ERRORS':
      return { ...state, errors: action.payload };

    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };

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
 * Hook to consume invoice context. Throws if used outside InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
