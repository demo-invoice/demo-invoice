import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type { InvoiceState, InvoiceAction, StringField } from '../types/invoice';

/** Whitelisted string fields to prevent prototype pollution. */
const STRING_FIELDS = new Set<StringField>(['clientName', 'notes', 'currency']);

const initialState: InvoiceState = {
  clientName: '',
  notes: '',
  currency: 'USD',
  lineItems: [],
  errors: [],
};

/**
 * Pure reducer for invoice state.
 * SET_FIELD only updates whitelisted string fields.
 */
function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'SET_FIELD': {
      if (!STRING_FIELDS.has(action.field)) return state;
      return { ...state, [action.field]: action.value };
    }
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };
    case 'ADD_LINE_ITEM': {
      const newItem = {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        rate: 0,
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
    default:
      return state;
  }
}

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
 * Hook to consume InvoiceContext.
 * Throws if used outside InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
