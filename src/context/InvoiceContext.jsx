import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useCallback,
  useMemo,
} from 'react';

const STORAGE_KEY = 'invoice_logo';

/**
 * Action type for updating the invoice sent/status field.
 * @type {string}
 */
export const UPDATE_INVOICE_STATUS = 'UPDATE_INVOICE_STATUS';

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

/**
 * @typedef {{ status: string }} InvoiceState
 */

/** @type {InvoiceState} */
const initialInvoiceState = { status: 'Draft' };

/**
 * Reducer for invoice-level state (e.g. send status).
 * Default branch returns the exact same state reference per codebase convention.
 * @param {InvoiceState} state
 * @param {{ type: string, payload?: unknown }} action
 * @returns {InvoiceState}
 */
function invoiceReducer(state, action) {
  switch (action.type) {
    case UPDATE_INVOICE_STATUS:
      return { ...state, status: /** @type {string} */ (action.payload) };
    default:
      return state;
  }
}

/**
 * @typedef {Object} InvoiceContextValue
 * @property {string|null} logoDataUrl - Base64 data URL of the uploaded logo, or null.
 * @property {(dataUrl: string) => void} setLogoDataUrl - Persist a new logo data URL.
 * @property {() => void} removeLogo - Clear the logo from state and storage.
 * @property {string} status - Current invoice status (e.g. 'Draft', 'Sent').
 * @property {React.Dispatch<{ type: string, payload?: unknown }>} dispatch - Reducer dispatch.
 */

/** @type {React.Context<InvoiceContextValue>} */
const InvoiceContext = createContext(/** @type {InvoiceContextValue} */ ({
  logoDataUrl: null,
  setLogoDataUrl: () => {},
  removeLogo: () => {},
  status: 'Draft',
  dispatch: () => {},
}));

/**
 * Provides shared invoice state to the component tree.
 * Rehydrates logoDataUrl from localStorage on first render.
 * @param {{ children: React.ReactNode }} props
 */
export function InvoiceProvider({ children }) {
  const [logoDataUrl, setLogoState] = useState(() => readLogoFromStorage());
  const [invoiceState, dispatch] = useReducer(invoiceReducer, initialInvoiceState);

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
      status: invoiceState.status,
      dispatch,
    }),
    [logoDataUrl, setLogoDataUrl, removeLogo, invoiceState.status, dispatch]
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
