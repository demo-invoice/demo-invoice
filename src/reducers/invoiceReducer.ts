import type {
  ActiveInvoice,
  InvoiceAction,
  InvoiceState,
  SavedInvoice,
} from '../types/invoice';

/** localStorage key for the active invoice draft. */
export const ACTIVE_KEY = 'invoice_active_v1';

/** localStorage key for the saved invoice history list. */
export const HISTORY_KEY = 'invoice_history_v1';

/**
 * Builds a fresh default active invoice.
 * Called at reset time so issueDate reflects the actual current date.
 */
export function buildDefaultActive(): ActiveInvoice {
  return {
    invoiceNumber: '',
    clientName: '',
    issueDate: new Date().toISOString().slice(0, 10),
    total: 0,
  };
}

/**
 * Persists state slices to localStorage.
 */
function persist(state: InvoiceState): void {
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(state.active));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

/**
 * Loads initial state from localStorage, falling back to defaults.
 */
export function loadInitialState(): InvoiceState {
  try {
    const rawActive = localStorage.getItem(ACTIVE_KEY);
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    const active: ActiveInvoice = rawActive
      ? (JSON.parse(rawActive) as ActiveInvoice)
      : buildDefaultActive();
    const history: SavedInvoice[] = rawHistory
      ? (JSON.parse(rawHistory) as SavedInvoice[])
      : [];
    return { active, history };
  } catch {
    return { active: buildDefaultActive(), history: [] };
  }
}

/**
 * Pure reducer for invoice state.
 * Side-effects (localStorage persistence) are applied after each transition.
 */
export function invoiceReducer(
  state: InvoiceState,
  action: InvoiceAction,
): InvoiceState {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      const next: InvoiceState = {
        ...state,
        active: { ...state.active, [action.field]: action.value },
      };
      persist(next);
      return next;
    }

    case 'SAVE_INVOICE': {
      const saved: SavedInvoice = {
        ...state.active,
        savedAt: new Date().toISOString(),
      };
      const next: InvoiceState = {
        ...state,
        history: [saved, ...state.history],
      };
      persist(next);
      return next;
    }

    case 'RESET_INVOICE': {
      const next: InvoiceState = {
        ...state,
        active: buildDefaultActive(),
      };
      persist(next);
      return next;
    }

    case 'LOAD_SAVED_INVOICE': {
      const { savedAt: _savedAt, ...activeFields } = action.invoice;
      void _savedAt;
      const next: InvoiceState = {
        ...state,
        active: activeFields,
      };
      persist(next);
      return next;
    }

    default:
      void (action as never);
      return state;
  }
}
