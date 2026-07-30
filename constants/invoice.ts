/**
 * Default invoice state factory.
 * Called at reset time so dates are always fresh.
 */
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceState {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  items: InvoiceItem[];
  notes: string;
  taxRate: number;
}

/**
 * Creates a fresh default invoice state.
 * `issueDate` is computed at call time (not module load time)
 * so every reset reflects the actual current date.
 */
export function createDefaultState(): InvoiceState {
  return {
    invoiceNumber: 'INV-001',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    fromName: '',
    fromEmail: '',
    fromAddress: '',
    toName: '',
    toEmail: '',
    toAddress: '',
    items: [],
    notes: '',
    taxRate: 0,
  };
}
