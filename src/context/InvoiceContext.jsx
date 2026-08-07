import React, {
  createContext,
  useContext,
  useState,
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
 * @typedef {Object} InvoiceContextValue
 * @property {string|null} logoDataUrl - Base64 data URL of the uploaded logo, or null.
 * @property {(dataUrl: string) => void} setLogoDataUrl - Persist a new logo data URL.
 * @property {() => void} removeLogo - Clear the logo from state and storage.
 */

/** @type {React.Context<InvoiceContextValue>} */
const InvoiceContext = createContext(/** @type {InvoiceContextValue} */ ({
  logoDataUrl: null,
  setLogoDataUrl: () => {},
  removeLogo: () => {},
}));

/**
 * Provides shared invoice state to the component tree.
 * Rehydrates logoDataUrl from localStorage on first render.
 * @param {{ children: React.ReactNode }} props
 */
export function InvoiceProvider({ children }) {
  const [logoDataUrl, setLogoState] = useState(() => readLogoFromStorage());

  const setLogoDataUrl = useCallback((dataUrl) => {
    writeLogoToStorage(dataUrl);
    setLogoState(dataUrl);
  }, []);

  const removeLogo = useCallback(() => {
    removeLogoFromStorage();
    setLogoState(null);
  }, []);

  const value = useMemo(
    () => ({ logoDataUrl, setLogoDataUrl, removeLogo }),
    [logoDataUrl, setLogoDataUrl, removeLogo]
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
