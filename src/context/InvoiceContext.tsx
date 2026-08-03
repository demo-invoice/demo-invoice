import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { InvoiceState, InvoiceAction, SavedInvoice } from '../types/invoice';

/** localStorage key for the active (in-progress) invoice. */
export const INVOICE_STORAGE_KEY = 'invoice_active_v1';

/** localStorage key for the saved invoices history list. */
export const SAVED_INVOICES_KEY = 'invoice_history_v1';

/** Returns today's date as an ISO date string (YYYY-MM-DD). */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Builds the default blank invoice state. */
function defaultState(): InvoiceState {
  return {
    invoiceNumber: '',
    clientName: '',
    issueDate: todayISO(),
    lineItems: [],
    total: 0,
  };
}

/** Reads and parses the active invoice from localStorage, falling back to default. */
function loadActiveInvoice(): InvoiceState {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as InvoiceState;
    }
  } catch {
    // Ignore parse errors — fall through to default.
  }
  return defaultState();
}

/** Reads and parses the saved invoices list from localStorage. */
function loadSavedInvoices(): SavedInvoice[] {
  try {
    const raw = localStorage.getItem(SAVED_INVOICES_KEY);
    if (raw) {
      return JSON.parse(raw) as SavedInvoice[];
    }
  } catch {
    // Ignore parse errors.
  }
  return [];
}

interface ReducerState {
  active: InvoiceState;
  savedInvoices: SavedInvoice[];
}

/** Pure reducer — no side-effects. */
function invoiceReducer(state: ReducerState, action: InvoiceAction): ReducerState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        active: { ...state.active, [action.field]: action.value },
      };

    case 'SAVE_INVOICE': {
      const entry: SavedInvoice = {
        invoiceNumber: state.active.invoiceNumber,
        clientName: state.active.clientName,
        issueDate: state.active.issueDate,
        total: state.active.total,
        snapshot: { ...state.active },
      };
      return {
        ...state,
        savedInvoices: [...state.savedInvoices, entry],
      };
    }

    case 'LOAD_SAVED_INVOICE':
      return {
        ...state,
        active: { ...action.payload.snapshot },
      };

    case 'RESET_INVOICE':
      return {
        ...state,
        active: defaultState(),
      };

    default:
      return state;
  }
}

interface InvoiceContextValue {
  active: InvoiceState;
  savedInvoices: SavedInvoice[];
  dispatch: React.Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/** Provides invoice state and dispatch to the component tree. */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, () => ({
    active: loadActiveInvoice(),
    savedInvoices: loadSavedInvoices(),
  }));

  // Persist active invoice whenever it changes.
  useEffect(() => {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(state.active));
  }, [state.active]);

  // Persist saved invoices list whenever it changes.
  useEffect(() => {
    localStorage.setItem(SAVED_INVOICES_KEY, JSON.stringify(state.savedInvoices));
  }, [state.savedInvoices]);

  // Wrap dispatch to handle RESET side-effect (remove active key).
  const wrappedDispatch = useCallback(
    (action: InvoiceAction) => {
      if (action.type === 'RESET_INVOICE') {
        localStorage.removeItem(INVOICE_STORAGE_KEY);
      }
      dispatch(action);
    },
    [],
  );

  return (
    <InvoiceContext.Provider
      value={{ active: state.active, savedInvoices: state.savedInvoices, dispatch: wrappedDispatch }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Hook to consume InvoiceContext.
 * Throws if used outside of InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider.');
  }
  return ctx;
}
