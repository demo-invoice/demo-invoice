import { describe, it, expect } from 'vitest';
import { buildMailtoUri, buildInvoiceBody } from '../utils/invoiceEmail';
import type { Invoice } from '../types/invoice';

const baseInvoice: Invoice = {
  invoiceNumber: 'INV-042',
  companyName: 'Acme Corp',
  clientName: 'Bob Builder',
  clientEmail: 'bob@example.com',
  issuedAt: '2024-07-01',
  dueAt: '2024-07-31',
  taxRate: 0.1,
  lineItems: [
    { id: '1', description: 'Widget A', quantity: 2, unitPrice: 50 },
    { id: '2', description: 'Service B', quantity: 1, unitPrice: 200 },
  ],
};

describe('buildMailtoUri', () => {
  it('starts with the mailto: scheme', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', 'Test Subject', '');
    expect(uri.startsWith('mailto:')).toBe(true);
  });

  it('encodes the recipient in the URI', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', 'Subject', '');
    expect(uri).toContain(encodeURIComponent('bob@example.com'));
  });

  it('includes the subject in the URI', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', 'My Subject', '');
    expect(uri).toContain(encodeURIComponent('My Subject'));
  });

  it('includes the body in the URI', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', 'Subject', '');
    expect(uri).toContain('body=');
  });

  it('uses a default subject when subject is blank', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', '', '');
    expect(uri).toContain(encodeURIComponent('Invoice #INV-042 from Acme Corp'));
  });

  it('truncates body and appends notice when URI exceeds 2000 chars', () => {
    const longInvoice: Invoice = {
      ...baseInvoice,
      lineItems: Array.from({ length: 50 }, (_, i) => ({
        id: String(i),
        description: `A very long description for item number ${i} that adds bulk`,
        quantity: 10,
        unitPrice: 99.99,
      })),
    };
    const uri = buildMailtoUri(longInvoice, 'bob@example.com', 'Subject', '');
    expect(uri.length).toBeLessThanOrEqual(2000);
    expect(uri).toContain(encodeURIComponent('[Invoice details truncated'));
  });

  it('renders gracefully with zero line items', () => {
    const emptyInvoice: Invoice = { ...baseInvoice, lineItems: [] };
    const uri = buildMailtoUri(emptyInvoice, 'bob@example.com', 'Subject', '');
    expect(uri).toContain('body=');
    expect(uri).toContain(encodeURIComponent('No line items'));
  });
});

describe('buildInvoiceBody', () => {
  it('includes invoice number', () => {
    const body = buildInvoiceBody(baseInvoice, '');
    expect(body).toContain('INV-042');
  });

  it('includes company name', () => {
    const body = buildInvoiceBody(baseInvoice, '');
    expect(body).toContain('Acme Corp');
  });

  it('includes the custom message when provided', () => {
    const body = buildInvoiceBody(baseInvoice, 'Hello Bob!');
    expect(body).toContain('Hello Bob!');
  });

  it('calculates totals correctly', () => {
    // subtotal = 2*50 + 1*200 = 300; tax = 30; total = 330
    const body = buildInvoiceBody(baseInvoice, '');
    expect(body).toContain('$300.00');
    expect(body).toContain('$30.00');
    expect(body).toContain('$330.00');
  });

  it('shows zero totals for empty line items', () => {
    const body = buildInvoiceBody({ ...baseInvoice, lineItems: [] }, '');
    expect(body).toContain('$0.00');
  });
});
