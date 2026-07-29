import { create } from 'zustand';
import type { InvoiceState, LineItem } from '../types/invoice';

// ---------------------------------------------------------------------------
// Default / initial state
// ---------------------------------------------------------------------------

const defaultState: InvoiceState = {
  sender: {
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: '',
    phone: '',
    email: '',
  },
  client: {
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: '',
  },
  meta: {
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
    taxRate: 0,
    currency: 'GBP',
    notes: '',
  },
  lineItems: [],
};

// ---------------------------------------------------------------------------
// Store actions interface
// ---------------------------------------------------------------------------

interface InvoiceActions {
  setInvoiceState: (state: Partial<InvoiceState>) => void;
  setMeta: (meta: Partial<InvoiceState['meta']>) => void;
  setSender: (sender: Partial<InvoiceState['sender']>) => void;
  setClient: (client: Partial<InvoiceState['client']>) => void;
  setLineItems: (lineItems: LineItem[]) => void;
}

// ---------------------------------------------------------------------------
// Zustand store
// ---------------------------------------------------------------------------

/**
 * Central Zustand store for all invoice data.
 * The form writes to this store; the preview reads from it.
 * Never mutate state directly — use the exposed action methods.
 */
export const useInvoiceStore = create<InvoiceState & InvoiceActions>((set) => ({
  ...defaultState,

  setInvoiceState: (partial) =>
    set((prev) => ({ ...prev, ...partial })),

  setMeta: (meta) =>
    set((prev) => ({ meta: { ...prev.meta, ...meta } })),

  setSender: (sender) =>
    set((prev) => ({ sender: { ...prev.sender, ...sender } })),

  setClient: (client) =>
    set((prev) => ({ client: { ...prev.client, ...client } })),

  setLineItems: (lineItems) => set({ lineItems }),
}));

// ---------------------------------------------------------------------------
// Pure selector functions (defined outside components for referential stability)
// ---------------------------------------------------------------------------

/**
 * Computes the total for a single line item (quantity × unitPrice).
 * Returns a negative value for credit lines — validation is the form's concern.
 */
export function selectLineItemTotal(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

/**
 * Computes the invoice subtotal (sum of all line item totals).
 * Returns 0 for an empty line items array.
 */
export function selectSubtotal(state: InvoiceState): number {
  return state.lineItems.reduce(
    (acc, item) => acc + selectLineItemTotal(item),
    0,
  );
}

/**
 * Computes the tax amount based on the subtotal and the meta taxRate.
 * Tax rate of 0 returns 0 — the tax row still renders per spec.
 */
export function selectTaxAmount(state: InvoiceState): number {
  return selectSubtotal(state) * (state.meta.taxRate / 100);
}

/**
 * Computes the grand total (subtotal + tax).
 */
export function selectGrandTotal(state: InvoiceState): number {
  return selectSubtotal(state) + selectTaxAmount(state);
}
