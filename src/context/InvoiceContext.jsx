import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useReducer,
} from 'react';

const STORAGE_KEY = 'invoice_logo';

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
 * @typedef {'idle'|'sent'} InvoiceStatus
 *
 * @typedef {Object} InvoiceState
 * @property {InvoiceStatus} status
 *
 * @typedef {{ type: 'UPDATE_INVOICE_STATUS', payload: InvoiceStatus }} UpdateInvoiceStatusAction
 * @typedef {UpdateInvoiceStatusAction} InvoiceAction
 */

/** @type {InvoiceState} */
const initialInvoiceState = { status: 'idle' };

/**
 * Reducer for invoice-level actions.
 * @param {InvoiceState} state
 * @param {InvoiceAction} action
 * @returns {InvoiceState}
 */
function invoiceReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_INVOICE_STATUS':
      return { ...state, status: action.payload };
    default:
      return state;
  }
}

/**
 * @typedef {Object} InvoiceContextValue
 * @property {string|null} logoDataUrl - Base64 data URL of the uploaded logo, or null.
 * @property {(dataUrl: string) => void} setLogoDataUrl - Persist a new logo data URL.
 * @property {() => void} removeLogo - Clear the logo from state and storage.
 * @property {InvoiceState} invoiceState - Current invoice-level state.
 * @property {React.Dispatch<InvoiceAction>} dispatch - Dispatch invoice actions.
 */

/** @type {React.Context<InvoiceContextValue>} */
const InvoiceContext = createContext(/** @type {InvoiceContextValue} */ ({
  logoDataUrl: null,
  setLogoDataUrl: () => {},
  removeLogo: () => {},
  invoiceState: initialInvoiceState,
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
    () => ({ logoDataUrl, setLogoDataUrl, removeLogo, invoiceState, dispatch }),
    [logoDataUrl, setLogoDataUrl, removeLogo, invoiceState]
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
