import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createDefaultState, InvoiceState } from '../../constants/invoice';

export const INVOICE_STORAGE_KEY = 'invoice-data';

type Action =
  | { type: 'RESET_INVOICE' }
  | { type: 'UPDATE_FIELD'; field: keyof InvoiceState; value: string | number }
  | { type: 'ADD_ITEM' }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_ITEM'; id: string; field: string; value: string | number };

export type InvoiceAction = Action;

type StateWithMeta = InvoiceState & { _lastAction?: string };

export function invoiceReducer(
  state: StateWithMeta,
  action: Action
): StateWithMeta {
  switch (action.type) {
    case 'RESET_INVOICE':
      return { ...createDefaultState(), _lastAction: 'RESET_INVOICE' };

    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value, _lastAction: 'UPDATE_FIELD' };

    case 'ADD_ITEM': {
      const newItem = {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
      };
      return { ...state, items: [...state.items, newItem], _lastAction: 'ADD_ITEM' };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
        _lastAction: 'REMOVE_ITEM',
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, [action.field]: action.value } : item
        ),
        _lastAction: 'UPDATE_ITEM',
      };

    default:
      return state;
  }
}

function loadState(): StateWithMeta {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as StateWithMeta;
    }
  } catch {
    // ignore
  }
  return createDefaultState();
}

const InvoiceStateContext = createContext<StateWithMeta | undefined>(undefined);
const InvoiceDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, loadState);

  useEffect(() => {
    if (state._lastAction === 'RESET_INVOICE') {
      return;
    }
    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  return React.createElement(
    InvoiceStateContext.Provider,
    { value: state },
    React.createElement(
      InvoiceDispatchContext.Provider,
      { value: dispatch },
      children
    )
  );
}

export function useInvoiceState(): StateWithMeta {
  const ctx = useContext(InvoiceStateContext);
  if (!ctx) throw new Error('useInvoiceState must be used within InvoiceProvider');
  return ctx;
}

export function useInvoiceDispatch(): React.Dispatch<Action> {
  const ctx = useContext(InvoiceDispatchContext);
  if (!ctx) throw new Error('useInvoiceDispatch must be used within InvoiceProvider');
  return ctx;
}
