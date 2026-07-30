import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import { INVOICE_STORAGE_KEY, createDefaultState } from '../constants/invoice';
import type { InvoiceState, InvoiceAction, InvoiceContextType } from '../types/invoice';

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer for invoice state.
 * Every case stamps `_lastAction` so the persistence effect can inspect it.
 */
export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'RESET_INVOICE':
      // createDefaultState() called here so issueDate = today at reset time.
      return { ...createDefaultState(), _lastAction: 'RESET_INVOICE' };
    case 'SET_INVOICE_NUMBER':
      return { ...state, invoiceNumber: action.payload, _lastAction: action.type };
    case 'SET_ISSUE_DATE':
      return { ...state, issueDate: action.payload, _lastAction: action.type };
    case 'SET_DUE_DATE':
      return { ...state, dueDate: action.payload, _lastAction: action.type };
    case 'SET_FROM_NAME':
      return { ...state, fromName: action.payload, _lastAction: action.type };
    case 'SET_FROM_EMAIL':
      return { ...state, fromEmail: action.payload, _lastAction: action.type };
    case 'SET_TO_NAME':
      return { ...state, toName: action.payload, _lastAction: action.type };
    case 'SET_TO_EMAIL':
      return { ...state, toEmail: action.payload, _lastAction: action.type };
    case 'SET_NOTES':
      return { ...state, notes: action.payload, _lastAction: action.type };
    case 'ADD_LINE_ITEM':
      return {
        ...state,
        lineItems: [
          ...state.lineItems,
          { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
        ],
        _lastAction: action.type,
      };
    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter((li) => li.id !== action.payload),
        _lastAction: action.type,
      };
    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((li) =>
          li.id === action.payload.id ? action.payload : li,
        ),
        _lastAction: action.type,
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

const InvoiceContext = createContext<InvoiceContextType | null>(null);

/**
 * Loads persisted invoice state from localStorage.
 * Falls back to createDefaultState() on missing key or invalid JSON.
 */
function loadPersistedState(): InvoiceState {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (raw === null) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<InvoiceState>;
    // Merge with defaults to handle schema evolution.
    return { ...createDefaultState(), ...parsed, _lastAction: '' };
  } catch {
    return createDefaultState();
  }
}

/**
 * Provides invoice state and dispatch to the component tree.
 * Persistence behaviour:
 *  - On every state change EXCEPT RESET_INVOICE → writes to localStorage.
 *  - On RESET_INVOICE → skips setItem so the key is absent after reset.
 *    (Header.handleNewInvoice already called removeItem before dispatching.)
 */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, loadPersistedState);

  useEffect(() => {
    if (state._lastAction === 'RESET_INVOICE') {
      // Key was already removed by Header; do not re-write defaults.
      return;
    }
    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota exceeded or private-browsing restriction — fail silently.
    }
  }, [state]);

  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Consumes InvoiceContext.
 * Throws if used outside of InvoiceProvider.
 */
export function useInvoice(): InvoiceContextType {
  const ctx = useContext(InvoiceContext);
  if (ctx === null) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
