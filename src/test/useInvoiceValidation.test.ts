import { describe, it, expect } from 'vitest';
import { validate } from '../hooks/useInvoiceValidation';
import type { InvoiceState } from '../types/invoice';

const baseState: InvoiceState = {
  invoiceNumber: 'INV-001',
  issueDate: '2024-01-01',
  dueDate: '2024-01-31',
  sender: { name: 'Acme Corp', email: 'billing@acme.com', address: '123 Main St' },
  client: { name: 'Client Co', email: 'ap@client.com', address: '456 Oak Ave' },
  lineItems: [
    { id: '1', description: 'Consulting', quantity: 2, unitPrice: 500 },
  ],
  taxRate: 10,
  notes: '',
  logo: '',
  logoMime: '',
};

describe('validate', () => {
  it('returns isValid=true for a fully populated state', () => {
    const result = validate(baseState);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('requires invoiceNumber', () => {
    const result = validate({ ...baseState, invoiceNumber: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.invoiceNumber).toBeDefined();
  });

  it('requires invoiceNumber (whitespace only)', () => {
    const result = validate({ ...baseState, invoiceNumber: '   ' });
    expect(result.isValid).toBe(false);
    expect(result.errors.invoiceNumber).toBeDefined();
  });

  it('requires sender name', () => {
    const result = validate({ ...baseState, sender: { ...baseState.sender, name: '' } });
    expect(result.isValid).toBe(false);
    expect(result.errors.senderName).toBeDefined();
  });

  it('requires sender email', () => {
    const result = validate({ ...baseState, sender: { ...baseState.sender, email: '' } });
    expect(result.isValid).toBe(false);
    expect(result.errors.senderEmail).toBeDefined();
  });

  it('requires client name', () => {
    const result = validate({ ...baseState, client: { ...baseState.client, name: '' } });
    expect(result.isValid).toBe(false);
    expect(result.errors.clientName).toBeDefined();
  });

  it('requires at least one valid line item', () => {
    const result = validate({ ...baseState, lineItems: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors.lineItems).toBeDefined();
  });

  it('rejects line items with quantity=0', () => {
    const result = validate({
      ...baseState,
      lineItems: [{ id: '1', description: 'Test', quantity: 0, unitPrice: 100 }],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.lineItems).toBeDefined();
  });

  it('rejects line items with empty description', () => {
    const result = validate({
      ...baseState,
      lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 100 }],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.lineItems).toBeDefined();
  });

  it('accepts line items with unitPrice=0 (free items)', () => {
    const result = validate({
      ...baseState,
      lineItems: [{ id: '1', description: 'Free item', quantity: 1, unitPrice: 0 }],
    });
    expect(result.isValid).toBe(true);
  });

  it('accumulates multiple errors', () => {
    const result = validate({
      ...baseState,
      invoiceNumber: '',
      sender: { ...baseState.sender, name: '' },
      lineItems: [],
    });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3);
  });
});
