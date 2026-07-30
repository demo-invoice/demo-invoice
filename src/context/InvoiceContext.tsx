import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { InvoiceState, InvoiceAction } from '../types/invoice';

const initialState: InvoiceState = {
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  clientName: '',
  currency: 'USD',
  notes: '',
  lineItems: [],
  errors: {},
};

/** Pure reducer — handles all InvoiceAction types. */
export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };

    case 'SET_ERRORS':
      return { ...state, errors: action.payload };

    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };

    case 'ADD_LINE_ITEM':
      return { ...state, lineItems: [...state.lineItems, action.payload] };

    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter((li) => li.id !== action.payload.id),
      };

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((li) =>
          li.id === action.payload.id
            ? { ...li, [action.payload.field]: action.payload.value }
            : li,
        ),
      };

    default: {
      const _exhaustive: never = action;
      return state;
      // eslint-disable-next-line no-unreachable
      void _exhaustive;
    }
  }
}

interface InvoiceContextValue {
  state: InvoiceState;
  dispatch: Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/** Provides invoice state and dispatch to the component tree. */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);
  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/** Hook to consume invoice context. Throws if used outside InvoiceProvider. */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoice must be used within InvoiceProvider');
  return ctx;
}
