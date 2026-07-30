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
  qty: number;
  unitPrice: number;
}

export interface InvoiceState {
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  lineItems: LineItem[];
}

export type InvoiceAction =
  | { type: 'SET_CLIENT_NAME'; payload: string }
  | { type: 'SET_CLIENT_EMAIL'; payload: string }
  | { type: 'SET_INVOICE_NUMBER'; payload: string }
  | { type: 'SET_ISSUE_DATE'; payload: string }
  | { type: 'SET_DUE_DATE'; payload: string }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'ADD_LINE_ITEM'; payload: LineItem }
  | { type: 'UPDATE_LINE_ITEM'; payload: LineItem }
  | { type: 'REMOVE_LINE_ITEM'; payload: string };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: InvoiceState = {
  clientName: '',
  clientEmail: '',
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  notes: '',
  lineItems: [],
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer for invoice state.
 * Each action maps to a single field update or line-item mutation.
 */
export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'SET_CLIENT_NAME':
      return { ...state, clientName: action.payload };
    case 'SET_CLIENT_EMAIL':
      return { ...state, clientEmail: action.payload };
    case 'SET_INVOICE_NUMBER':
      return { ...state, invoiceNumber: action.payload };
    case 'SET_ISSUE_DATE':
      return { ...state, issueDate: action.payload };
    case 'SET_DUE_DATE':
      return { ...state, dueDate: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'ADD_LINE_ITEM':
      return { ...state, lineItems: [...state.lineItems, action.payload] };
    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };
    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.payload),
      };
    default: {
      const _exhaustive: never = action;
      return state;
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
 * Provides invoice state and dispatch to the component tree.
 */
export function InvoiceProvider({ children }: { children: ReactNode }): JSX.Element {
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
