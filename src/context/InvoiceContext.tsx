import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { Invoice, SendStatus } from '../types/invoice';

// ---------------------------------------------------------------------------
// Action union — exhaustive, no raw string dispatches allowed
// ---------------------------------------------------------------------------

type SetInvoiceFieldAction = {
  type: 'SET_INVOICE_FIELD';
  payload: Partial<Invoice>;
};

type SetSendStatusAction = {
  type: 'SET_SEND_STATUS';
  payload: SendStatus;
};

type ResetInvoiceAction = {
  type: 'RESET_INVOICE';
};

/** Discriminated union of every action the reducer accepts. */
export type InvoiceAction =
  | SetInvoiceFieldAction
  | SetSendStatusAction
  | ResetInvoiceAction;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface InvoiceState {
  invoice: Invoice;
  sendStatus: SendStatus;
}

const defaultInvoice: Invoice = {
  id: crypto.randomUUID(),
  invoiceNumber: 'INV-001',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  fromName: '',
  fromEmail: '',
  toName: '',
  toEmail: '',
  lineItems: [],
  notes: '',
};

const initialState: InvoiceState = {
  invoice: defaultInvoice,
  sendStatus: 'idle',
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer for invoice state. The `never` exhaustive check ensures
 * TypeScript will error at compile time if a new action type is added to
 * the union but not handled here.
 */
export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'SET_INVOICE_FIELD':
      return { ...state, invoice: { ...state.invoice, ...action.payload } };

    case 'SET_SEND_STATUS':
      return { ...state, sendStatus: action.payload };

    case 'RESET_INVOICE':
      return {
        ...initialState,
        invoice: { ...defaultInvoice, id: crypto.randomUUID() },
      };

    default: {
      // Exhaustive check — this line is unreachable at runtime;
      // TypeScript will flag unhandled action types at compile time.
      const _exhaustive: never = action;
      return state;
      // eslint-disable-next-line no-unreachable
      void _exhaustive;
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

/** Provides invoice state and dispatch to the component tree. */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);
  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Hook to consume InvoiceContext. Throws if used outside InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoice must be used within InvoiceProvider');
  return ctx;
}
