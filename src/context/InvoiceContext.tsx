import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type { InvoiceState, InvoiceAction, LineItem } from '../types/invoice';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: InvoiceState = {
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  senderAddress1: '',
  senderAddress2: '',
  billToName: '',
  billToEmail: '',
  billToPhone: '',
  billToAddress1: '',
  billToAddress2: '',
  lineItems: [],
  taxRate: '0',
  notes: '',
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/** Pure reducer — no side-effects, no async. */
function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };

    case 'ADD_LINE_ITEM': {
      const newItem: LineItem = {
        id: crypto.randomUUID(),
        description: '',
        quantity: '1',
        unitPrice: '0',
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

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

const InvoiceStateContext = createContext<InvoiceState | undefined>(undefined);
const InvoiceDispatchContext = createContext<React.Dispatch<InvoiceAction> | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/** Wraps the application and provides shared invoice state + dispatch. */
export function InvoiceProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);
  return (
    <InvoiceStateContext.Provider value={state}>
      <InvoiceDispatchContext.Provider value={dispatch}>
        {children}
      </InvoiceDispatchContext.Provider>
    </InvoiceStateContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Read-only selector hook for invoice state.
 * Used exclusively by preview components — never dispatches.
 */
export function useInvoiceState(): InvoiceState {
  const ctx = useContext(InvoiceStateContext);
  if (ctx === undefined) {
    throw new Error('useInvoiceState must be used within an InvoiceProvider');
  }
  return ctx;
}

/**
 * Write hook that returns the dispatch function.
 * Used exclusively by form components.
 */
export function useInvoiceDispatch(): React.Dispatch<InvoiceAction> {
  const ctx = useContext(InvoiceDispatchContext);
  if (ctx === undefined) {
    throw new Error('useInvoiceDispatch must be used within an InvoiceProvider');
  }
  return ctx;
}
