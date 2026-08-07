import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
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
 * @typedef {'SET_LOGO' | 'REMOVE_LOGO' | 'SEND_EMAIL'} ActionType
 *
 * @typedef {Object} Action
 * @property {ActionType} type
 * @property {string} [payload]
 *
 * @typedef {Object} InvoiceState
 * @property {string|null} logoDataUrl - Base64 data URL of the uploaded logo, or null.
 * @property {boolean} emailSent - Whether the invoice has been sent by email.
 *
 * @typedef {Object} InvoiceContextValue
 * @property {string|null} logoDataUrl
 * @property {boolean} emailSent
 * @property {(dataUrl: string) => void} setLogoDataUrl
 * @property {() => void} removeLogo
 * @property {React.Dispatch<Action>} dispatch
 */

/**
 * Initial state for the invoice reducer.
 * @type {InvoiceState}
 */
const initialState = {
  logoDataUrl: readLogoFromStorage(),
  emailSent: false,
};

/**
 * Invoice reducer — handles all invoice-related state transitions.
 * Exported as a named export so it can be tested in isolation.
 *
 * @param {InvoiceState} state
 * @param {Action} action
 * @returns {InvoiceState}
 */
export function invoiceReducer(state, action) {
  switch (action.type) {
    case 'SET_LOGO':
      return { ...state, logoDataUrl: action.payload ?? null };

    case 'REMOVE_LOGO':
      return { ...state, logoDataUrl: null };

    case 'SEND_EMAIL':
      return { ...state, emailSent: true };

    default:
      return state;
  }
}

/** @type {React.Context<InvoiceContextValue>} */
const InvoiceContext = createContext(/** @type {InvoiceContextValue} */ ({
  logoDataUrl: null,
  emailSent: false,
  setLogoDataUrl: () => {},
  removeLogo: () => {},
  dispatch: () => {},
}));

/**
 * Provides shared invoice state to the component tree.
 * Rehydrates logoDataUrl from localStorage on first render.
 * @param {{ children: React.ReactNode }} props
 */
export function InvoiceProvider({ children }) {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);

  const setLogoDataUrl = useCallback((dataUrl) => {
    writeLogoToStorage(dataUrl);
    dispatch({ type: 'SET_LOGO', payload: dataUrl });
  }, []);

  const removeLogo = useCallback(() => {
    removeLogoFromStorage();
    dispatch({ type: 'REMOVE_LOGO' });
  }, []);

  const value = useMemo(
    () => ({
      logoDataUrl: state.logoDataUrl,
      emailSent: state.emailSent,
      setLogoDataUrl,
      removeLogo,
      dispatch,
    }),
    [state.logoDataUrl, state.emailSent, setLogoDataUrl, removeLogo]
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

/**
 * Alias for useInvoice — used by SendEmailModal and other consumers
 * that prefer the `useInvoiceContext` name.
 * @returns {InvoiceContextValue}
 */
export function useInvoiceContext() {
  return useContext(InvoiceContext);
}
