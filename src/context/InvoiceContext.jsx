import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useCallback,
  useMemo,
} from 'react';

const STORAGE_KEY = 'invoice_logo';

// ─── localStorage helpers ────────────────────────────────────────────────────

/**
 * Safely read a value from localStorage.
 * Returns null if localStorage is unavailable or the stored value is invalid.
 * @returns {string|null}
 */
function readLogoFromStorage() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && value.startsWith('data:image/')) {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Safely write a value to localStorage.
 * Silently swallows errors (e.g. private browsing quota).
 * @param {string} dataUrl
 */
function writeLogoToStorage(dataUrl) {
  try {
    localStorage.setItem(STORAGE_KEY, dataUrl);
  } catch {
    // Degrade gracefully — feature still works in-memory.
  }
}

/**
 * Safely remove the logo entry from localStorage.
 */
function removeLogoFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Degrade gracefully.
  }
}

// ─── Invoice status reducer ──────────────────────────────────────────────────

/**
 * @typedef {'idle'|'Sent'} InvoiceStatus
 */

/**
 * @typedef {{ type: 'MARK_AS_SENT' }} InvoiceAction
 * Typed action union — add new action types here.
 */

/**
 * @typedef {Object} InvoiceStatusState
 * @property {InvoiceStatus} status
 */

/** @type {InvoiceStatusState} */
const INITIAL_STATUS_STATE = { status: 'idle' };

/**
 * Reducer for invoice status actions.
 * Unrecognised action types are a no-op (no localStorage write).
 *
 * @param {InvoiceStatusState} state
 * @param {InvoiceAction} action
 * @returns {InvoiceStatusState}
 */
function invoiceStatusReducer(state, action) {
  switch (action.type) {
    case 'MARK_AS_SENT':
      return { ...state, status: 'Sent' };
    default:
      // Unrecognised action — return state unchanged, no side effects.
      return state;
  }
}

// ─── Context definition ──────────────────────────────────────────────────────

/**
 * @typedef {Object} InvoiceContextValue
 * @property {string|null}    logoDataUrl    - Base64 data URL of the uploaded logo, or null.
 * @property {(dataUrl: string) => void} setLogoDataUrl - Persist a new logo data URL.
 * @property {() => void}     removeLogo     - Clear the logo from state and storage.
 * @property {InvoiceStatus}  invoiceStatus  - Current invoice send status.
 * @property {(action: InvoiceAction) => void} dispatchInvoice - Dispatch an invoice action.
 */

/** @type {React.Context<InvoiceContextValue>} */
const InvoiceContext = createContext(/** @type {InvoiceContextValue} */ ({
  logoDataUrl: null,
  setLogoDataUrl: () => {},
  removeLogo: () => {},
  invoiceStatus: 'idle',
  dispatchInvoice: () => {},
}));

/**
 * Provides shared invoice state to the component tree.
 * Rehydrates logoDataUrl from localStorage on first render.
 * @param {{ children: React.ReactNode }} props
 */
export function InvoiceProvider({ children }) {
  const [logoDataUrl, setLogoState] = useState(() => readLogoFromStorage());
  const [statusState, dispatchInvoice] = useReducer(
    invoiceStatusReducer,
    INITIAL_STATUS_STATE
  );

  const setLogoDataUrl = useCallback((dataUrl) => {
    writeLogoToStorage(dataUrl);
    setLogoState(dataUrl);
  }, []);

  const removeLogo = useCallback(() => {
    removeLogoFromStorage();
    setLogoState(null);
  }, []);

  const value = useMemo(
    () => ({
      logoDataUrl,
      setLogoDataUrl,
      removeLogo,
      invoiceStatus: statusState.status,
      dispatchInvoice,
    }),
    [logoDataUrl, setLogoDataUrl, removeLogo, statusState.status, dispatchInvoice]
  );

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Consume the InvoiceContext.
 * Must be used within an InvoiceProvider.
 * @returns {InvoiceContextValue}
 */
export function useInvoice() {
  return useContext(InvoiceContext);
}
