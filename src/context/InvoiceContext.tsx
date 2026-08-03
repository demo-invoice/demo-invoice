import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { InvoiceAction, InvoiceState } from '../types/invoice';
import { invoiceReducer, loadInitialState } from '../reducers/invoiceReducer';

interface InvoiceContextValue {
  state: InvoiceState;
  dispatch: Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/**
 * Provides invoice state and dispatch to the component tree.
 * Initialises from localStorage via loadInitialState().
 */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, loadInitialState);

  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Consumes the InvoiceContext.
 * Throws if used outside of InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
