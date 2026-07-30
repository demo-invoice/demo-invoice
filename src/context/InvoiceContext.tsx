/**
 * InvoiceContext — shared invoice state via React Context + useReducer.
 *
 * Preview components consume ONLY `useInvoiceState` (read).
 * Form components consume `useInvoiceDispatch` (write).
 */
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type { InvoiceState, InvoiceAction, SenderInfo, ClientInfo, InvoiceMeta } from '../types/invoice';

// ---------------------------------------------------------------------------
// Default / empty state
// ---------------------------------------------------------------------------

const emptySender: SenderInfo = {
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: '',
};

const emptyClient: ClientInfo = {
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  email: '',
};

const defaultMeta: InvoiceMeta = {
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  currency: 'GBP',
  taxRate: 0,
};

export const defaultInvoiceState: InvoiceState = {
  sender: emptySender,
  client: emptyClient,
  meta: defaultMeta,
  lineItems: [],
  notes: '',
  logoUrl: '',
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/** Pure reducer — no side effects. */
export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'SET_SENDER':
      return { ...state, sender: { ...state.sender, ...action.payload } };
    case 'SET_CLIENT':
      return { ...state, client: { ...state.client, ...action.payload } };
    case 'SET_META':
      return { ...state, meta: { ...state.meta, ...action.payload } };
    case 'SET_LINE_ITEMS':
      return { ...state, lineItems: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_LOGO_URL':
      return { ...state, logoUrl: action.payload };
    case 'RESET':
      return defaultInvoiceState;
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

const InvoiceStateContext = createContext<InvoiceState | undefined>(undefined);
const InvoiceDispatchContext = createContext<
  React.Dispatch<InvoiceAction> | undefined
>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface InvoiceProviderProps {
  children: ReactNode;
  /** Optional initial state override (useful for tests) */
  initialState?: InvoiceState;
}

/** Wraps the app (or a subtree) with invoice state. */
export function InvoiceProvider({
  children,
  initialState = defaultInvoiceState,
}: InvoiceProviderProps): JSX.Element {
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
 * Read-only access to invoice state.
 * Safe to call from preview components.
 */
export function useInvoiceState(): InvoiceState {
  const ctx = useContext(InvoiceStateContext);
  if (ctx === undefined) {
    throw new Error('useInvoiceState must be used within an InvoiceProvider');
  }
  return ctx;
}

/**
 * Write access — dispatch actions to mutate invoice state.
 * Must NOT be called from preview components.
 */
export function useInvoiceDispatch(): React.Dispatch<InvoiceAction> {
  const ctx = useContext(InvoiceDispatchContext);
  if (ctx === undefined) {
    throw new Error('useInvoiceDispatch must be used within an InvoiceProvider');
  }
  return ctx;
}
