/**
 * InvoiceContext — provides invoice state and dispatch to the component tree.
 *
 * Reducer handles:
 *   SET_INVOICE            — replace entire invoice
 *   UPDATE_FIELD           — patch a single typed field
 *   UPDATE_INVOICE_STATUS  — update status (e.g. 'Draft' → 'Sent')
 *
 * Status defaults to 'Draft' for legacy invoice objects that lack the field.
 */
import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type { Invoice, InvoiceAction, InvoiceStatus } from '@/types/invoice';

const DEFAULT_INVOICE: Invoice = {
  id: '1',
  number: '001',
  clientName: '',
  clientEmail: '',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  lineItems: [],
  notes: '',
  status: 'Draft',
};

/** Pure reducer — returns state unchanged for unrecognised action types. */
export function invoiceReducer(state: Invoice, action: InvoiceAction): Invoice {
  switch (action.type) {
    case 'SET_INVOICE':
      return { ...action.payload, status: action.payload.status ?? 'Draft' };

    case 'UPDATE_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };

    case 'UPDATE_INVOICE_STATUS': {
      const allowed: InvoiceStatus[] = ['Draft', 'Sent', 'Paid'];
      if (!allowed.includes(action.payload)) return state;
      return { ...state, status: action.payload };
    }

    default:
      // Exhaustiveness guard — keeps CI honest if a new action is added
      // without a matching case.
      return state;
  }
}

interface InvoiceContextValue {
  invoice: Invoice;
  dispatch: React.Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/** Wrap the app (or a subtree) with this provider to access invoice state. */
export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoice, dispatch] = useReducer(invoiceReducer, DEFAULT_INVOICE);
  return (
    <InvoiceContext.Provider value={{ invoice, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/**
 * Hook to consume InvoiceContext.
 * Throws if used outside of InvoiceProvider.
 */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
}
