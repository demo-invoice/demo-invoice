import React, { createContext, useContext, useReducer, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Action type constants
// ---------------------------------------------------------------------------
export const UPDATE_INVOICE_STATUS = 'UPDATE_INVOICE_STATUS';
export const UPDATE_FIELD = 'UPDATE_FIELD';

const STORAGE_KEY = 'invoice_logo';

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

/** @returns {string|null} */
function readLogoFromStorage() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && value.startsWith('data:image/') ? value : null;
  } catch {
    return null;
  }
}

/** @param {string} dataUrl */
function writeLogoToStorage(dataUrl) {
  try {
    localStorage.setItem(STORAGE_KEY, dataUrl);
  } catch {
    // Degrade gracefully — feature still works in-memory.
  }
}

function removeLogoFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Degrade gracefully.
  }
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} InvoiceState
 * @property {string} invoiceNumber
 * @property {string} clientName
 * @property {string} clientEmail
 * @property {Array<{description: string, quantity: number, unitPrice: number}>} lineItems
 * @property {number} subtotal
 * @property {number} tax
 * @property {number} total
 * @property {string} invoiceDate
 * @property {string} dueDate
 * @property {string} status
 * @property {string|null} logoDataUrl
 */

/** @returns {InvoiceState} */
function buildInitialState() {
  return {
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    lineItems: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    invoiceDate: '',
    dueDate: '',
    status: '',
    logoDataUrl: readLogoFromStorage(),
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Invoice reducer.
 * @param {InvoiceState} state
 * @param {{ type: string, field?: string, value?: unknown }} action
 * @returns {InvoiceState}
 */
function invoiceReducer(state, action) {
  switch (action.type) {
    case UPDATE_FIELD: {
      const { field, value } = action;
      if (field === 'lineItems' && !Array.isArray(value)) {
        return state;
      }
      if (field === 'logoDataUrl') {
        if (value) writeLogoToStorage(/** @type {string} */ (value));
        else removeLogoFromStorage();
      }
      return { ...state, [field]: value };
    }
    case UPDATE_INVOICE_STATUS:
      return { ...state, status: action.value };
    default:
      // Must return the exact same reference for unknown actions.
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * @typedef {InvoiceState & { dispatch: React.Dispatch<{type: string, field?: string, value?: unknown}> }} InvoiceContextValue
 */

/** @type {React.Context<InvoiceContextValue>} */
const InvoiceContext = createContext(/** @type {InvoiceContextValue} */ ({
  invoiceNumber: '',
  clientName: '',
  clientEmail: '',
  lineItems: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  invoiceDate: '',
  dueDate: '',
  status: '',
  logoDataUrl: null,
  dispatch: () => {},
}));

/**
 * Provides shared invoice state to the component tree.
 * @param {{ children: React.ReactNode }} props
 */
export function InvoiceProvider({ children }) {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, buildInitialState);

  const value = useMemo(
    () => ({ ...state, dispatch }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
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
