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

describe('buildInvoiceBody', () => {
  it('includes the invoice number', () => {
    expect(buildInvoiceBody(baseInvoice, '')).toContain('INV-042');
  });

  it('includes the company name', () => {
    expect(buildInvoiceBody(baseInvoice, '')).toContain('Acme Corp');
  });

  it('includes the client name', () => {
    expect(buildInvoiceBody(baseInvoice, '')).toContain('Bob Builder');
  });

  it('includes the issued date', () => {
    expect(buildInvoiceBody(baseInvoice, '')).toContain('2024-07-01');
  });

  it('includes the due date', () => {
    expect(buildInvoiceBody(baseInvoice, '')).toContain('2024-07-31');
  });

  it('includes a custom message when provided', () => {
    expect(buildInvoiceBody(baseInvoice, 'Hello Bob!')).toContain('Hello Bob!');
  });

  it('does not include a blank custom message prefix', () => {
    const body = buildInvoiceBody(baseInvoice, '');
    // Body should start with the invoice number line, not a blank line from an empty message
    expect(body.startsWith('Invoice #')).toBe(true);
  });

  it('calculates subtotal correctly (2×$50 + 1×$200 = $300)', () => {
    expect(buildInvoiceBody(baseInvoice, '')).toContain('$300.00');
  });

  it('calculates tax correctly (10% of $300 = $30)', () => {
    expect(buildInvoiceBody(baseInvoice, '')).toContain('$30.00');
  });

  it('calculates total correctly ($300 + $30 = $330)', () => {
    expect(buildInvoiceBody(baseInvoice, '')).toContain('$330.00');
  });

  it('renders gracefully with zero line items — shows (No line items)', () => {
    const body = buildInvoiceBody({ ...baseInvoice, lineItems: [] }, '');
    expect(body).toContain('(No line items)');
  });

  it('shows zero totals for an invoice with no line items', () => {
    const body = buildInvoiceBody({ ...baseInvoice, lineItems: [] }, '');
    expect(body).toContain('$0.00');
  });

  it('includes line item descriptions', () => {
    const body = buildInvoiceBody(baseInvoice, '');
    expect(body).toContain('Widget A');
    expect(body).toContain('Service B');
  });
});

describe('buildMailtoUri', () => {
  it('starts with the mailto: scheme', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', 'Subject', '');
    expect(uri.startsWith('mailto:')).toBe(true);
  });

  it('encodes the recipient address in the URI', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', 'Subject', '');
    expect(uri).toContain(encodeURIComponent('bob@example.com'));
  });

  it('encodes the subject in the URI', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', 'My Subject', '');
    expect(uri).toContain(encodeURIComponent('My Subject'));
  });

  it('includes a body parameter', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', 'Subject', '');
    expect(uri).toContain('body=');
  });

  it('uses a default subject when subject is blank', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', '', '');
    expect(uri).toContain(encodeURIComponent('Invoice #INV-042 from Acme Corp'));
  });

  it('uses a default subject when subject is whitespace-only', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', '   ', '');
    expect(uri).toContain(encodeURIComponent('Invoice #INV-042 from Acme Corp'));
  });

  it('truncates body and appends truncation notice when URI exceeds 2000 chars', () => {
    const longInvoice: Invoice = {
      ...baseInvoice,
      lineItems: Array.from({ length: 50 }, (_, i) => ({
        id: String(i),
        description: `A very long description for item number ${i} that adds bulk to the body`,
        quantity: 10,
        unitPrice: 99.99,
      })),
    };
    const uri = buildMailtoUri(longInvoice, 'bob@example.com', 'Subject', '');
    expect(uri.length).toBeLessThanOrEqual(2000);
    expect(uri).toContain(encodeURIComponent('[Invoice details truncated'));
  });

  it('renders gracefully with zero line items', () => {
    const uri = buildMailtoUri({ ...baseInvoice, lineItems: [] }, 'bob@example.com', 'Subject', '');
    expect(uri).toContain('body=');
    expect(uri).toContain(encodeURIComponent('(No line items)'));
  });

  it('includes a custom message in the body', () => {
    const uri = buildMailtoUri(baseInvoice, 'bob@example.com', 'Subject', 'Hi Bob!');
    expect(uri).toContain(encodeURIComponent('Hi Bob!'));
  });
});
