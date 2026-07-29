import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LOGO_STORAGE_KEY = 'invoice_logo';

/**
 * @typedef {Object} InvoiceContextValue
 * @property {string|null} logo - Base64 data URL of the business logo, or null.
 * @property {function(string|null): void} setLogo - Action to update the logo.
 */

/** @type {React.Context<InvoiceContextValue>} */
const InvoiceContext = createContext({
  logo: null,
  setLogo: () => {},
});

/**
 * Safely reads a value from localStorage, returning null on failure.
 * @param {string} key
 * @returns {string|null}
 */
function safeLocalStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely writes a value to localStorage, swallowing quota/access errors.
 * @param {string} key
 * @param {string|null} value - Pass null to remove the key.
 */
function safeLocalStorageSet(key, value) {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Quota exceeded or private browsing — degrade gracefully.
  }
}

/**
 * Provides shared invoice state (including logo) to the component tree.
 * Rehydrates logo from localStorage on mount.
 * @param {{ children: React.ReactNode }} props
 */
export function InvoiceContextProvider({ children }) {
  const [logo, setLogoState] = useState(() => safeLocalStorageGet(LOGO_STORAGE_KEY));

  /**
   * Updates the logo in state and persists it to localStorage.
   * Pass null to clear the logo.
   * @param {string|null} newLogo
   */
  const setLogo = useCallback((newLogo) => {
    setLogoState(newLogo);
    safeLocalStorageSet(LOGO_STORAGE_KEY, newLogo);
  }, []);

  return (
    <InvoiceContext.Provider value={{ logo, setLogo }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Hook to consume InvoiceContext.
 * @returns {InvoiceContextValue}
 */
export function useInvoice() {
  return useContext(InvoiceContext);
}
