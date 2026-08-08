import React, { createContext, useContext, useReducer } from 'react';

export const InvoiceContext = createContext(
  /** @type {any} */ (null)
);

const initialState = {
  lineItems: [],
  clientName: '',
  clientEmail: '',
  invoiceNumber: '',
  status: 'Draft',
  logoDataUrl: null,
  yourDetails: '',
  currency: 'USD',
};

export const UPDATE_INVOICE_STATUS = 'UPDATE_INVOICE_STATUS';

function invoiceReducer(state, action) {
  switch (action.type) {
    case 'SET_LOGO_DATA_URL':
      return { ...state, logoDataUrl: action.payload };
    case 'REMOVE_LOGO':
      return { ...state, logoDataUrl: null };
    case 'SET_CLIENT_NAME':
      return { ...state, clientName: action.payload };
    case 'SET_CLIENT_EMAIL':
      return { ...state, clientEmail: action.payload };
    case 'SET_INVOICE_NUMBER':
      return { ...state, invoiceNumber: action.payload };
    case 'SET_LINE_ITEMS':
      return { ...state, lineItems: action.payload };
    case 'SET_YOUR_DETAILS':
      return { ...state, yourDetails: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case UPDATE_INVOICE_STATUS:
      return { ...state, status: action.value };
    default:
      return state;
  }
}

export function InvoiceProvider({ children }) {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);

  const value = {
    ...state,
    dispatch,
    setLogoDataUrl: (url) => dispatch({ type: 'SET_LOGO_DATA_URL', payload: url }),
    removeLogo: () => dispatch({ type: 'REMOVE_LOGO' }),
    setClientName: (name) => dispatch({ type: 'SET_CLIENT_NAME', payload: name }),
    setClientEmail: (email) => dispatch({ type: 'SET_CLIENT_EMAIL', payload: email }),
    setInvoiceNumber: (num) => dispatch({ type: 'SET_INVOICE_NUMBER', payload: num }),
    setLineItems: (items) => dispatch({ type: 'SET_LINE_ITEMS', payload: items }),
    setYourDetails: (details) => dispatch({ type: 'SET_YOUR_DETAILS', payload: details }),
    setCurrency: (currency) => dispatch({ type: 'SET_CURRENCY', payload: currency }),
  };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
}
