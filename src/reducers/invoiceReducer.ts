import type { InvoiceAction, InvoiceState, ActiveInvoice } from '../types/invoice';

/** Build a fresh active invoice with today's date. Called at reset time, never at module load. */
export function buildDefaultActive(): ActiveInvoice {
  return {
    invoiceNumber: '',
    clientName: '',
    issueDate: new Date().toISOString().split('T')[0],
    total: 0,
    lineItems: [],
  };
}

/** Initial application state. savedInvoices starts empty; active is built fresh. */
export const initialState: InvoiceState = {
  active: buildDefaultActive(),
  savedInvoices: [],
};

/**
 * Pure reducer for all invoice actions.
 *
 * @param state  - Current state.
 * @param action - Dispatched action.
 * @returns New state.
 */
export function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'UPDATE_STRING_FIELD':
      return {
        ...state,
        active: { ...state.active, [action.field]: action.value },
      };

    case 'UPDATE_NUMBER_FIELD':
      return {
        ...state,
        active: { ...state.active, [action.field]: action.value },
      };

    case 'SAVE_INVOICE': {
      const snapshot = {
        ...state.active,
        savedAt: new Date().toISOString(),
      };
      return {
        ...state,
        savedInvoices: [...state.savedInvoices, snapshot],
      };
    }

    case 'LOAD_SAVED_INVOICE': {
      // Spread defaults first so any optional fields missing from the snapshot
      // do not result in undefined access.
      const restoredActive: ActiveInvoice = {
        ...buildDefaultActive(),
        ...action.payload,
      };
      // NOTE: lineItems are restored in state from the saved snapshot but are
      // not yet surfaced in the form UI. A future iteration should render the
      // line-items table and wire it to this restored value.
      return {
        ...state,
        active: restoredActive,
      };
    }

    case 'RESET_INVOICE':
      // issueDate is computed fresh at reset time (not at module load).
      return {
        ...state,
        active: buildDefaultActive(),
      };

    default: {
      // Exhaustiveness check — TypeScript will error if a case is missing.
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
