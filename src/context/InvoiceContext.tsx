import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';

/** localStorage key — single source of truth, imported everywhere. */
export const INVOICE_STORAGE_KEY = 'demo-invoice:state';

/** A single line item on the invoice. */
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/** Full shape of the invoice state. */
export interface InvoiceState {
  invoiceNumber: string;
  issueDate: string;
  fromName: string;
  toName: string;
  notes: string;
  lineItems: LineItem[];
}

/** Returns a fresh default state, computing issueDate at call time. */
export function createDefaultState(): InvoiceState {
  return {
    invoiceNumber: 'INV-001',
    issueDate: new Date().toISOString().split('T')[0],
    fromName: '',
    toName: '',
    notes: '',
    lineItems: [],
  };
}

/** Discriminated union of all dispatchable actions. */
export type InvoiceAction =
  | { type: 'UPDATE_FIELD'; field: keyof Omit<InvoiceState, 'lineItems'>; value: string }
  | { type: 'ADD_LINE_ITEM'; item: LineItem }
  | { type: 'REMOVE_LINE_ITEM'; id: string }
  | { type: 'UPDATE_LINE_ITEM'; item: LineItem }
  | { type: 'RESET_INVOICE' };

/**
 * Pure reducer for invoice state.
 * RESET_INVOICE always recomputes issueDate via createDefaultState().
 */
export function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };

    case 'ADD_LINE_ITEM':
      return { ...state, lineItems: [...state.lineItems, action.item] };

    case 'REMOVE_LINE_ITEM':
      return { ...state, lineItems: state.lineItems.filter((li) => li.id !== action.id) };

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((li) => (li.id === action.item.id ? action.item : li)),
      };

    case 'RESET_INVOICE':
      return createDefaultState();

    default: {
      // Exhaustiveness check — TypeScript will error if a case is missing.
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

/** Loads persisted state from localStorage, falling back to defaults on any error. */
function loadPersistedState(): InvoiceState {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) return createDefaultState();
    return JSON.parse(raw) as InvoiceState;
  } catch {
    // Corrupted JSON or unavailable storage — degrade gracefully.
    return createDefaultState();
  }
}

interface InvoiceContextValue {
  state: InvoiceState;
  dispatch: React.Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/**
 * Provides invoice state and dispatch to the component tree.
 * Persists state to localStorage on every change except RESET_INVOICE,
 * which removes the key entirely.
 */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, loadPersistedState);

  useEffect(() => {
    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota exceeded or unavailable — ignore silently.
    }
  }, [state]);

  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
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
