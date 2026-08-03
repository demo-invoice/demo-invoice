/**
 * Represents a single line item on an invoice.
 */
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Core invoice data model.
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  lineItems: LineItem[];
  notes: string;
}

/**
 * Lifecycle states for the email-send operation.
 */
export type SendStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Shape of the result returned by emailService.sendInvoice.
 */
export interface SendResult {
  ok: boolean;
  message: string;
}
