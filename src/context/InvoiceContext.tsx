import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InvoiceState {
  issueDate: string;
  logoDataUrl: string | null;
  lineItems: LineItem[];
  /** Incremented on every non-RESET action. Used as persistence effect dep. */
  _persistVersion: number;
  /** Last action type dispatched. Used to branch persist vs. remove. */
  _lastAction: InvoiceActionType;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceActionType =
  | 'RESET_INVOICE'
  | 'SET_LOGO'
  | 'ADD_LINE_ITEM'
  | 'UPDATE_LINE_ITEM'
  | 'REMOVE_LINE_ITEM';

export type InvoiceAction =
  | { type: 'RESET_INVOICE' }
  | { type: 'SET_LOGO'; payload: string | null }
  | { type: 'ADD_LINE_ITEM'; payload: LineItem }
  | { type: 'UPDATE_LINE_ITEM'; payload: LineItem }
  | { type: 'REMOVE_LINE_ITEM'; payload: string };

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

export const INVOICE_STORAGE_KEY = 'demo-invoice-state';

// ---------------------------------------------------------------------------
// Default state factory — called at dispatch time so issueDate is always today
// ---------------------------------------------------------------------------

/**
 * Returns a fresh default InvoiceState with today's date as issueDate.
 * Must be called at dispatch time (not module load time) to stay current.
 */
export function makeDefaultState(): InvoiceState {
  return {
    issueDate: new Date().toISOString().slice(0, 10),
    logoDataUrl: null,
    lineItems: [],
    _persistVersion: 0,
    _lastAction: 'RESET_INVOICE',
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Invoice reducer.
 * RESET_INVOICE calls makeDefaultState() at dispatch time — _persistVersion
 * is NOT incremented so the persistence effect takes the removeItem branch.
 */
export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'RESET_INVOICE':
      // Return fresh default; _persistVersion stays 0 (not incremented).
      return makeDefaultState();

    case 'SET_LOGO':
      return {
        ...state,
        logoDataUrl: action.payload,
        _persistVersion: state._persistVersion + 1,
        _lastAction: 'SET_LOGO',
      };

    case 'ADD_LINE_ITEM':
      return {
        ...state,
        lineItems: [...state.lineItems, action.payload],
        _persistVersion: state._persistVersion + 1,
        _lastAction: 'ADD_LINE_ITEM',
      };

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
        _persistVersion: state._persistVersion + 1,
        _lastAction: 'UPDATE_LINE_ITEM',
      };

    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.payload),
        _persistVersion: state._persistVersion + 1,
        _lastAction: 'REMOVE_LINE_ITEM',
      };

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
  dispatch: React.Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface InvoiceProviderProps {
  children: ReactNode;
}

/**
 * Provides invoice state and dispatch to the component tree.
 * Persists state to localStorage on every non-RESET action.
 * On RESET_INVOICE, removes the stored key instead of writing empty state.
 */
export function InvoiceProvider({ children }: InvoiceProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, makeDefaultState);

  // Persist on every non-RESET mutation.
  // Depends on _persistVersion + _lastAction so it only runs when something
  // actually changed — not on every render.
  useEffect(() => {
    if (state._lastAction === 'RESET_INVOICE') {
      try {
        localStorage.removeItem(INVOICE_STORAGE_KEY);
      } catch {
        // Safari private mode blocks localStorage — swallow silently.
      }
      return;
    }
    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Safari private mode blocks localStorage — swallow silently.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state._persistVersion, state._lastAction]);

  const value: InvoiceContextValue = { state, dispatch };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the current InvoiceContext value.
 * Throws if used outside of InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
