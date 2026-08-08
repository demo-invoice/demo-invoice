import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';

const STORAGE_KEY = 'invoice_logo';

/**
 * Action type for updating the invoice status after a successful email send.
 * Exported so consumers (e.g. SendEmailModal) can import the constant.
 */
export const UPDATE_INVOICE_STATUS = 'UPDATE_INVOICE_STATUS';

/**
 * Safely read a value from localStorage.
 * @returns {string|null}
 */
function readLogoFromStorage() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && value.startsWith('data:image/')) return value;
    return null;
  } catch {
    return null;
  }
}

/** @param {string} dataUrl */
function writeLogoToStorage(dataUrl) {
  try {
    localStorage.setItem(STORAGE_KEY, dataUrl);
  } catch {
    // Degrade gracefully.
  }
}

function removeLogoFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Degrade gracefully.
  }
}

/**
 * @typedef {Object} LineItem
 * @property {string} description
 * @property {number} quantity
 * @property {number} unitPrice
 */

/**
 * @typedef {Object} InvoiceState
 * @property {string|null} logoDataUrl
 * @property {string} clientName
 * @property {string} clientEmail
 * @property {LineItem[]} lineItems
 * @property {number} subtotal
 * @property {number} tax
 * @property {number} total
 * @property {string} invoiceNumber
 * @property {string} invoiceDate
 * @property {string} dueDate
 * @property {string} status
 */

/** @type {InvoiceState} */
const initialState = {
  logoDataUrl: null,
  clientName: '',
  clientEmail: '',
  lineItems: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  invoiceNumber: '',
  invoiceDate: '',
  dueDate: '',
  status: 'draft',
};

/**
 * @typedef {Object} InvoiceContextValue
 * @property {InvoiceState} invoiceState
 * @property {(dataUrl: string) => void} setLogoDataUrl
 * @property {() => void} removeLogo
 * @property {(action: { type: string, payload?: unknown }) => void} dispatch
 */

/** @type {React.Context<InvoiceContextValue>} */
const InvoiceContext = createContext(/** @type {InvoiceContextValue} */ ({
  invoiceState: initialState,
  setLogoDataUrl: () => {},
  removeLogo: () => {},
  dispatch: () => {},
}));

/**
 * Reducer for invoice state.
 * @param {InvoiceState} state
 * @param {{ type: string, payload?: unknown }} action
 * @returns {InvoiceState}
 */
function invoiceReducer(state, action) {
  switch (action.type) {
    case UPDATE_INVOICE_STATUS:
      return { ...state, status: /** @type {string} */ (action.payload) };
    case 'SET_LOGO':
      return { ...state, logoDataUrl: /** @type {string} */ (action.payload) };
    case 'REMOVE_LOGO':
      return { ...state, logoDataUrl: null };
    default:
      return state;
  }
}

/**
 * Provides shared invoice state to the component tree.
 * @param {{ children: React.ReactNode }} props
 */
export function InvoiceProvider({ children }) {
  const [invoiceState, dispatch] = useReducer(invoiceReducer, {
    ...initialState,
    logoDataUrl: readLogoFromStorage(),
  });

  const setLogoDataUrl = useCallback((dataUrl) => {
    writeLogoToStorage(dataUrl);
    dispatch({ type: 'SET_LOGO', payload: dataUrl });
  }, []);

  const removeLogo = useCallback(() => {
    removeLogoFromStorage();
    dispatch({ type: 'REMOVE_LOGO' });
  }, []);

  const value = useMemo(
    () => ({ invoiceState, setLogoDataUrl, removeLogo, dispatch }),
    [invoiceState, setLogoDataUrl, removeLogo, dispatch]
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
