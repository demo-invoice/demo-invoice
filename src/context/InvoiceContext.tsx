/**
 * InvoiceContext — application-wide invoice state managed via useReducer.
 *
 * Persistence contract
 * --------------------
 * The persistence useEffect writes state to localStorage on every meaningful
 * state change.  After a RESET_INVOICE action the effect removes the stored
 * key (so the next page-load starts fresh) and returns early — it must NOT
 * call setItem with the freshly-reset state, because that would immediately
 * re-persist the blank invoice and defeat the reset.
 *
 * The dependency array is `[state, state._lastAction]`.  Including
 * `state._lastAction` explicitly makes the intent clear to the linter and
 * ensures the effect re-runs whenever the action tag changes, even if the
 * rest of the state object is referentially equal (which cannot happen with
 * useReducer, but is good practice).
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type Dispatch,
} from 'react';

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

export const INVOICE_STORAGE_KEY = 'demo-invoice:state';

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface InvoiceState {
  issueDate: string;
  dueDate: string;
  invoiceNumber: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  lineItems: LineItem[];
  logoDataUrl: string | null;
  /** Tag of the most-recently dispatched action; undefined on initial load. */
  _lastAction?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

// ---------------------------------------------------------------------------
// Action union  — only typed members; no raw string literals at call sites
// ---------------------------------------------------------------------------

export type InvoiceAction =
  | { type: 'UPDATE_FIELD'; field: keyof Omit<InvoiceState, '_lastAction' | 'lineItems' | 'logoDataUrl'>; value: string }
  | { type: 'SET_LOGO'; dataUrl: string | null }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'UPDATE_LINE_ITEM'; id: string; field: keyof Omit<LineItem, 'id'>; value: string | number }
  | { type: 'REMOVE_LINE_ITEM'; id: string }
  | { type: 'RESET_INVOICE' };

// ---------------------------------------------------------------------------
// Default state factory — called at dispatch time for RESET_INVOICE so that
// issueDate always reflects the moment the user clicked "New Invoice".
// ---------------------------------------------------------------------------

export function makeDefaultState(): InvoiceState {
  return {
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    invoiceNumber: '',
    fromName: '',
    fromEmail: '',
    toName: '',
    toEmail: '',
    lineItems: [],
    logoDataUrl: null,
    _lastAction: undefined,
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value, _lastAction: 'UPDATE_FIELD' };

    case 'SET_LOGO':
      return { ...state, logoDataUrl: action.dataUrl, _lastAction: 'SET_LOGO' };

    case 'ADD_LINE_ITEM':
      return {
        ...state,
        lineItems: [
          ...state.lineItems,
          { id: generateId(), description: '', quantity: 1, unitPrice: 0 },
        ],
        _lastAction: 'ADD_LINE_ITEM',
      };

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.id ? { ...item, [action.field]: action.value } : item,
        ),
        _lastAction: 'UPDATE_LINE_ITEM',
      };

    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.id),
        _lastAction: 'REMOVE_LINE_ITEM',
      };

    case 'RESET_INVOICE':
      // makeDefaultState() is called HERE (dispatch time) so issueDate is
      // always the current date, not the date the module was first loaded.
      return { ...makeDefaultState(), _lastAction: 'RESET_INVOICE' };

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Load persisted state
// ---------------------------------------------------------------------------

function loadPersistedState(): InvoiceState {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) return makeDefaultState();
    const parsed = JSON.parse(raw) as Partial<InvoiceState>;
    // Merge with defaults so new fields added in future versions are present.
    return { ...makeDefaultState(), ...parsed, _lastAction: undefined };
  } catch {
    return makeDefaultState();
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

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, loadPersistedState);

  /**
   * Persistence effect.
   *
   * Dependency array: `[state, state._lastAction]`
   * - `state` ensures the effect re-runs on every state change (field edits,
   *   logo uploads, line-item mutations).
   * - `state._lastAction` is listed explicitly so the linter can see the
   *   guard condition is covered by the deps.
   *
   * Guard: after RESET_INVOICE we remove the stored key and return early.
   * We must NOT call setItem here — that would immediately re-persist the
   * blank invoice and defeat the reset.
   */
  useEffect(() => {
    if (state._lastAction === 'RESET_INVOICE') {
      localStorage.removeItem(INVOICE_STORAGE_KEY);
      return;
    }
    // Skip the initial mount when _lastAction is undefined (state was just
    // loaded from localStorage — no need to write it back immediately).
    if (state._lastAction === undefined) return;

    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota exceeded or private-browsing restriction — fail silently.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, state._lastAction]);

  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the full invoice context value `{ state, dispatch }`.
 * Throws if called outside of `<InvoiceProvider>`.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}

/**
 * Convenience accessor that returns the dispatch function directly.
 *
 * This hook exists so consumers that only need to dispatch actions do not have
 * to destructure `useInvoice()`.  It is NOT a performance optimisation — the
 * dispatch reference from useReducer is already stable across renders, so
 * wrapping it in useCallback would be a no-op.  The hook is intentionally
 * thin.
 *
 * @example
 * const dispatch = useInvoiceDispatch();
 * dispatch({ type: 'RESET_INVOICE' });
 */
export function useInvoiceDispatch(): Dispatch<InvoiceAction> {
  return useInvoice().dispatch;
}
