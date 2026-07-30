import { describe, it, expect, beforeEach, vi } from 'vitest';
import { invoiceReducer, createDefaultState, INVOICE_STORAGE_KEY } from './InvoiceContext';
import type { InvoiceState, LineItem } from './InvoiceContext';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeLineItem(overrides?: Partial<LineItem>): LineItem {
  return {
    id: 'test-id-1',
    description: 'Widget',
    quantity: 2,
    unitPrice: 9.99,
    ...overrides,
  };
}

function stateWithData(): InvoiceState {
  return {
    invoiceNumber: 'INV-042',
    issueDate: '2020-01-01',
    fromName: 'Acme Corp',
    toName: 'Client Ltd',
    notes: 'Net 30',
    lineItems: [makeLineItem()],
  };
}

// ── RESET_INVOICE ──────────────────────────────────────────────────────────

describe('invoiceReducer — RESET_INVOICE', () => {
  it('resets invoiceNumber to INV-001', () => {
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.invoiceNumber).toBe('INV-001');
  });

  it('resets issueDate to today (YYYY-MM-DD)', () => {
    const today = new Date().toISOString().split('T')[0];
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.issueDate).toBe(today);
  });

  it('clears fromName', () => {
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.fromName).toBe('');
  });

  it('clears toName', () => {
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.toName).toBe('');
  });

  it('clears notes', () => {
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.notes).toBe('');
  });

  it('clears lineItems to an empty array', () => {
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.lineItems).toEqual([]);
  });

  it('does not mutate the original state', () => {
    const original = stateWithData();
    invoiceReducer(original, { type: 'RESET_INVOICE' });
    expect(original.invoiceNumber).toBe('INV-042');
  });
});

// ── UPDATE_FIELD ───────────────────────────────────────────────────────────

describe('invoiceReducer — UPDATE_FIELD', () => {
  it('updates the specified field', () => {
    const next = invoiceReducer(createDefaultState(), {
      type: 'UPDATE_FIELD',
      field: 'fromName',
      value: 'New Corp',
    });
    expect(next.fromName).toBe('New Corp');
  });

  it('preserves all other fields', () => {
    const base = stateWithData();
    const next = invoiceReducer(base, {
      type: 'UPDATE_FIELD',
      field: 'notes',
      value: 'Updated note',
    });
    expect(next.invoiceNumber).toBe(base.invoiceNumber);
    expect(next.issueDate).toBe(base.issueDate);
    expect(next.fromName).toBe(base.fromName);
    expect(next.toName).toBe(base.toName);
    expect(next.lineItems).toEqual(base.lineItems);
  });
});

// ── ADD_LINE_ITEM ──────────────────────────────────────────────────────────

describe('invoiceReducer — ADD_LINE_ITEM', () => {
  it('appends a line item', () => {
    const item = makeLineItem();
    const next = invoiceReducer(createDefaultState(), { type: 'ADD_LINE_ITEM', item });
    expect(next.lineItems).toHaveLength(1);
    expect(next.lineItems[0]).toEqual(item);
  });
});

// ── REMOVE_LINE_ITEM ───────────────────────────────────────────────────────

describe('invoiceReducer — REMOVE_LINE_ITEM', () => {
  it('removes the item with the matching id', () => {
    const item = makeLineItem({ id: 'remove-me' });
    const base: InvoiceState = { ...createDefaultState(), lineItems: [item] };
    const next = invoiceReducer(base, { type: 'REMOVE_LINE_ITEM', id: 'remove-me' });
    expect(next.lineItems).toHaveLength(0);
  });

  it('leaves other items intact', () => {
    const keep = makeLineItem({ id: 'keep' });
    const remove = makeLineItem({ id: 'remove-me' });
    const base: InvoiceState = { ...createDefaultState(), lineItems: [keep, remove] };
    const next = invoiceReducer(base, { type: 'REMOVE_LINE_ITEM', id: 'remove-me' });
    expect(next.lineItems).toEqual([keep]);
  });
});

// ── UPDATE_LINE_ITEM ───────────────────────────────────────────────────────

describe('invoiceReducer — UPDATE_LINE_ITEM', () => {
  it('updates the matching line item', () => {
    const item = makeLineItem({ id: 'li-1', description: 'Old' });
    const base: InvoiceState = { ...createDefaultState(), lineItems: [item] };
    const updated = { ...item, description: 'New' };
    const next = invoiceReducer(base, { type: 'UPDATE_LINE_ITEM', item: updated });
    expect(next.lineItems[0].description).toBe('New');
  });
});

// ── createDefaultState ─────────────────────────────────────────────────────

describe('createDefaultState', () => {
  it('always returns invoiceNumber INV-001', () => {
    expect(createDefaultState().invoiceNumber).toBe('INV-001');
  });

  it('returns today as issueDate', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(createDefaultState().issueDate).toBe(today);
  });
});

// ── INVOICE_STORAGE_KEY ────────────────────────────────────────────────────

describe('INVOICE_STORAGE_KEY', () => {
  it('is a non-empty string', () => {
    expect(typeof INVOICE_STORAGE_KEY).toBe('string');
    expect(INVOICE_STORAGE_KEY.length).toBeGreaterThan(0);
  });
});
