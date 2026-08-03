import { describe, it, expect } from 'vitest';
import { serializeInvoiceToHtml } from '../utils/invoiceSerializer';
import type { Invoice } from '../types/invoice';

const baseInvoice: Invoice = {
  id: 'inv-1',
  invoiceNumber: 'INV-001',
  issueDate: '2024-01-01',
  dueDate: '2024-01-31',
  fromName: 'Alice',
  fromEmail: 'alice@example.com',
  toName: 'Bob',
  toEmail: 'bob@example.com',
  lineItems: [],
  notes: '',
};

describe('serializeInvoiceToHtml', () => {
  it('includes the invoice number in the output', () => {
    const html = serializeInvoiceToHtml(baseInvoice);
    expect(html).toContain('INV-001');
  });

  it('includes issue date and due date', () => {
    const html = serializeInvoiceToHtml(baseInvoice);
    expect(html).toContain('2024-01-01');
    expect(html).toContain('2024-01-31');
  });

  it('includes from and to names', () => {
    const html = serializeInvoiceToHtml(baseInvoice);
    expect(html).toContain('Alice');
    expect(html).toContain('Bob');
  });

  it('handles zero line items without throwing', () => {
    expect(() => serializeInvoiceToHtml(baseInvoice)).not.toThrow();
  });

  it('renders $0.00 total for empty line items', () => {
    const html = serializeInvoiceToHtml(baseInvoice);
    expect(html).toContain('$0.00');
  });

  it('renders line item description, quantity, and amount', () => {
    const invoice: Invoice = {
      ...baseInvoice,
      lineItems: [
        { id: 'li-1', description: 'Web Design', quantity: 2, unitPrice: 500 },
      ],
    };
    const html = serializeInvoiceToHtml(invoice);
    expect(html).toContain('Web Design');
    expect(html).toContain('$500.00');
    expect(html).toContain('$1,000.00');
  });

  it('sums multiple line items correctly', () => {
    const invoice: Invoice = {
      ...baseInvoice,
      lineItems: [
        { id: 'li-1', description: 'Item A', quantity: 1, unitPrice: 100 },
        { id: 'li-2', description: 'Item B', quantity: 3, unitPrice: 50 },
      ],
    };
    const html = serializeInvoiceToHtml(invoice);
    // Total = 100 + 150 = 250
    expect(html).toContain('$250.00');
  });

  it('escapes HTML special characters in description', () => {
    const invoice: Invoice = {
      ...baseInvoice,
      lineItems: [
        { id: 'li-1', description: '<script>alert(1)</script>', quantity: 1, unitPrice: 10 },
      ],
    };
    const html = serializeInvoiceToHtml(invoice);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('includes notes when present', () => {
    const invoice: Invoice = { ...baseInvoice, notes: 'Net 30 payment terms' };
    const html = serializeInvoiceToHtml(invoice);
    expect(html).toContain('Net 30 payment terms');
  });

  it('omits notes section when notes is empty', () => {
    const html = serializeInvoiceToHtml(baseInvoice);
    expect(html).not.toContain('Notes:');
  });

  it('returns a valid HTML document string', () => {
    const html = serializeInvoiceToHtml(baseInvoice);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });
});
