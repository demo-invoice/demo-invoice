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
  quantity: number;
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

// ---------------------------------------------------------------------------
// Discriminated union of typed actions — never dispatch a plain string.
// ---------------------------------------------------------------------------

export type InvoiceAction =
  | { type: 'SET_CLIENT_NAME'; payload: string }
  | { type: 'SET_CLIENT_EMAIL'; payload: string }
  | { type: 'SET_INVOICE_NUMBER'; payload: string }
  | { type: 'SET_ISSUE_DATE'; payload: string }
  | { type: 'SET_DUE_DATE'; payload: string }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM'; payload: string }
  | {
      type: 'UPDATE_LINE_ITEM';
      payload: { id: string; field: keyof Omit<LineItem, 'id'>; value: string | number };
    };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: InvoiceState = {
  clientName: '',
  clientEmail: '',
  invoiceNumber: 'INV-001',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  notes: '',
  lineItems: [
    { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
  ],
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/** Pure reducer — handles every typed InvoiceAction. */
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
      return {
        ...state,
        lineItems: [
          ...state.lineItems,
          { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
        ],
      };
    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.payload),
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
 * Provides InvoiceState and typed dispatch to the component tree.
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
 * Consume InvoiceContext. Throws if used outside InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an <InvoiceProvider>.');
  }
  return ctx;
}
