/**
 * InvoiceContext — typed reducer + React context for invoice state.
 *
 * The ActionType discriminated union uses ONLY these exact string literals:
 *   UPDATE_INVOICE_FIELD | ADD_LINE_ITEM | REMOVE_LINE_ITEM | UPDATE_LINE_ITEM | SET_CURRENCY
 *
 * TypeScript strict mode ensures any unrecognised string literal is a compile error.
 */
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';

export interface LineItem {
  id: string;
  description: string;
  quantity: string;
  rate: string;
}

export interface InvoiceState {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  lineItems: LineItem[];
}

// ── Discriminated union — ONLY these exact string literals are valid ──────────
export type InvoiceAction =
  | { type: 'UPDATE_INVOICE_FIELD'; field: keyof Omit<InvoiceState, 'lineItems' | 'currency'>; value: string }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM'; id: string }
  | { type: 'UPDATE_LINE_ITEM'; id: string; field: keyof Omit<LineItem, 'id'>; value: string }
  | { type: 'SET_CURRENCY'; currency: string };

const initialState: InvoiceState = {
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  currency: 'USD',
  lineItems: [],
};

/** Pure reducer — exhaustive switch over the discriminated union. */
function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'UPDATE_INVOICE_FIELD':
      return { ...state, [action.field]: action.value };

    case 'ADD_LINE_ITEM': {
      const newItem: LineItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        description: '',
        quantity: '',
        rate: '',
      };
      return { ...state, lineItems: [...state.lineItems, newItem] };
    }

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

    case 'SET_CURRENCY':
      return { ...state, currency: action.currency };
  }
}

interface InvoiceContextValue {
  state: InvoiceState;
  dispatch: React.Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/** Provider — wrap the app with this to give all children access to invoice state. */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);
  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * useInvoice — consume invoice state and dispatch from any child component.
 * Throws if used outside InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoice must be used within an InvoiceProvider');
  return ctx;
}
