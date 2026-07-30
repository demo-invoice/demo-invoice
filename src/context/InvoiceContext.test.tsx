import { describe, it, expect } from 'vitest';
import {
  invoiceReducer,
  createDefaultState,
  INVOICE_STORAGE_KEY,
} from './InvoiceContext';
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

  it('resets issueDate to today in YYYY-MM-DD format', () => {
    const today = new Date().toISOString().split('T')[0];
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.issueDate).toBe(today);
  });

  it('clears fromName to empty string', () => {
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.fromName).toBe('');
  });

  it('clears toName to empty string', () => {
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.toName).toBe('');
  });

  it('clears notes to empty string', () => {
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.notes).toBe('');
  });

  it('clears lineItems to an empty array', () => {
    const next = invoiceReducer(stateWithData(), { type: 'RESET_INVOICE' });
    expect(next.lineItems).toEqual([]);
  });

  it('does not mutate the original state object', () => {
    const original = stateWithData();
    invoiceReducer(original, { type: 'RESET_INVOICE' });
    expect(original.invoiceNumber).toBe('INV-042');
    expect(original.fromName).toBe('Acme Corp');
    expect(original.lineItems).toHaveLength(1);
  });

  it('returns a new object reference', () => {
    const original = stateWithData();
    const next = invoiceReducer(original, { type: 'RESET_INVOICE' });
    expect(next).not.toBe(original);
  });
});

// ── UPDATE_FIELD ───────────────────────────────────────────────────────────

describe('invoiceReducer — UPDATE_FIELD', () => {
  it('updates the specified scalar field', () => {
    const next = invoiceReducer(createDefaultState(), {
      type: 'UPDATE_FIELD',
      field: 'fromName',
      value: 'New Corp',
    });
    expect(next.fromName).toBe('New Corp');
  });

  it('preserves all other fields when updating one', () => {
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
  it('appends the new line item to an empty list', () => {
    const item = makeLineItem();
    const next = invoiceReducer(createDefaultState(), { type: 'ADD_LINE_ITEM', item });
    expect(next.lineItems).toHaveLength(1);
    expect(next.lineItems[0]).toEqual(item);
  });

  it('appends to an existing list without mutating it', () => {
    const first = makeLineItem({ id: 'first' });
    const second = makeLineItem({ id: 'second' });
    const base: InvoiceState = { ...createDefaultState(), lineItems: [first] };
    const next = invoiceReducer(base, { type: 'ADD_LINE_ITEM', item: second });
    expect(next.lineItems).toHaveLength(2);
    expect(base.lineItems).toHaveLength(1); // original unchanged
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
  it('updates the matching line item in place', () => {
    const item = makeLineItem({ id: 'li-1', description: 'Old' });
    const base: InvoiceState = { ...createDefaultState(), lineItems: [item] };
    const updated = { ...item, description: 'New' };
    const next = invoiceReducer(base, { type: 'UPDATE_LINE_ITEM', item: updated });
    expect(next.lineItems[0].description).toBe('New');
  });

  it('does not affect other line items', () => {
    const a = makeLineItem({ id: 'a', description: 'Alpha' });
    const b = makeLineItem({ id: 'b', description: 'Beta' });
    const base: InvoiceState = { ...createDefaultState(), lineItems: [a, b] };
    const updatedA = { ...a, description: 'Alpha Updated' };
    const next = invoiceReducer(base, { type: 'UPDATE_LINE_ITEM', item: updatedA });
    expect(next.lineItems[1].description).toBe('Beta');
  });
});

// ── createDefaultState ─────────────────────────────────────────────────────

describe('createDefaultState', () => {
  it('returns invoiceNumber INV-001', () => {
    expect(createDefaultState().invoiceNumber).toBe('INV-001');
  });

  it('returns today as issueDate (YYYY-MM-DD)', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(createDefaultState().issueDate).toBe(today);
  });

  it('returns empty string for fromName', () => {
    expect(createDefaultState().fromName).toBe('');
  });

  it('returns empty string for toName', () => {
    expect(createDefaultState().toName).toBe('');
  });

  it('returns empty string for notes', () => {
    expect(createDefaultState().notes).toBe('');
  });

  it('returns an empty lineItems array', () => {
    expect(createDefaultState().lineItems).toEqual([]);
  });

  it('returns a new object on each call (no shared reference)', () => {
    const a = createDefaultState();
    const b = createDefaultState();
    expect(a).not.toBe(b);
  });
});

// ── INVOICE_STORAGE_KEY ────────────────────────────────────────────────────

describe('INVOICE_STORAGE_KEY', () => {
  it('is a non-empty string', () => {
    expect(typeof INVOICE_STORAGE_KEY).toBe('string');
    expect(INVOICE_STORAGE_KEY.length).toBeGreaterThan(0);
  });

  it('equals the expected constant value', () => {
    expect(INVOICE_STORAGE_KEY).toBe('demo-invoice:state');
  });
});
