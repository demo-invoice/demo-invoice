import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import type { InvoiceState, InvoiceAction, LineItem } from '../types/invoice';
import { generateId } from '../types/invoice';
import {
  loadInvoiceState,
  saveInvoiceState,
  clearInvoiceState,
} from './invoiceStorage';

// ---------------------------------------------------------------------------
// Default / blank state factory — called at reset time, NOT module load time,
// so Issue Date always reflects the current day when the user resets.
// ---------------------------------------------------------------------------

function makeDefaultState(): InvoiceState {
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 30);
  return {
    senderName: '',
    senderEmail: '',
    senderAddress: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    invoiceNumber: '',
    issueDate: now.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    lineItems: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0,
    logoDataUrl: '',
    notes: '',
    _lastAction: '',
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'SET_SENDER_NAME':    return { ...state, senderName:    action.payload, _lastAction: action.type };
    case 'SET_SENDER_EMAIL':   return { ...state, senderEmail:   action.payload, _lastAction: action.type };
    case 'SET_SENDER_ADDRESS': return { ...state, senderAddress: action.payload, _lastAction: action.type };
    case 'SET_CLIENT_NAME':    return { ...state, clientName:    action.payload, _lastAction: action.type };
    case 'SET_CLIENT_EMAIL':   return { ...state, clientEmail:   action.payload, _lastAction: action.type };
    case 'SET_CLIENT_ADDRESS': return { ...state, clientAddress: action.payload, _lastAction: action.type };
    case 'SET_INVOICE_NUMBER': return { ...state, invoiceNumber: action.payload, _lastAction: action.type };
    case 'SET_ISSUE_DATE':     return { ...state, issueDate:     action.payload, _lastAction: action.type };
    case 'SET_DUE_DATE':       return { ...state, dueDate:       action.payload, _lastAction: action.type };
    case 'SET_TAX_RATE':       return { ...state, taxRate:       action.payload, _lastAction: action.type };
    case 'SET_LOGO':           return { ...state, logoDataUrl:   action.payload, _lastAction: action.type };
    case 'SET_NOTES':          return { ...state, notes:         action.payload, _lastAction: action.type };

    case 'ADD_LINE_ITEM': {
      const newItem: LineItem = { id: generateId(), description: '', quantity: 1, unitPrice: 0 };
      return { ...state, lineItems: [...state.lineItems, newItem], _lastAction: action.type };
    }
    case 'REMOVE_LINE_ITEM': {
      const filtered = state.lineItems.filter(li => li.id !== action.payload);
      // Always keep at least one row.
      const lineItems = filtered.length > 0
        ? filtered
        : [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }];
      return { ...state, lineItems, _lastAction: action.type };
    }
    case 'UPDATE_LINE_ITEM': {
      const lineItems = state.lineItems.map(li =>
        li.id === action.payload.id ? action.payload : li,
      );
      return { ...state, lineItems, _lastAction: action.type };
    }

    // Defaults computed HERE (reset time), not at module load time.
    case 'RESET_INVOICE':
      return { ...makeDefaultState(), _lastAction: 'RESET_INVOICE' };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface InvoiceContextValue {
  state: InvoiceState;
  dispatch: React.Dispatch<InvoiceAction>;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

/** Provides invoice state and dispatch to the component tree. */
export function InvoiceProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const persisted = loadInvoiceState();
  const initial: InvoiceState = persisted
    ? { ...makeDefaultState(), ...persisted, _lastAction: '' }
    : makeDefaultState();

  const [state, dispatch] = useReducer(invoiceReducer, initial);

  // Persistence effect — guarded so RESET_INVOICE removes the key rather than
  // writing a blank record back to storage.
  useEffect(() => {
    if (state._lastAction === 'RESET_INVOICE') {
      clearInvoiceState();
    } else if (state._lastAction !== '') {
      saveInvoiceState(state);
    }
  }, [state]);

  return (
    <InvoiceContext.Provider value={{ state, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

/** Returns invoice context value; throws if used outside InvoiceProvider. */
export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoice must be used within an InvoiceProvider');
  return ctx;
}

/** Memoised dispatch wrapper — stable reference across renders. */
export function useInvoiceDispatch(): React.Dispatch<InvoiceAction> {
  const { dispatch } = useInvoice();
  return useCallback(dispatch, [dispatch]);
}
