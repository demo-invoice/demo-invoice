import type { InvoiceState } from '../types/invoice';

/** localStorage key used to persist invoice state. */
export const INVOICE_STORAGE_KEY = 'invoice_state';

/**
 * Creates a fresh default invoice state.
 * Called at reset time (not module load) so `issueDate` always
 * reflects the current date at the moment of invocation.
 */
export function createDefaultState(): InvoiceState {
  return {
    invoiceNumber: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    fromName: '',
    fromEmail: '',
    toName: '',
    toEmail: '',
    lineItems: [
      { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
    ],
    notes: '',
    _lastAction: '',
  };
}
