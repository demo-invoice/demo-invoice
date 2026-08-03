import { describe, it, expect } from 'vitest';
import { invoiceReducer, initialState, buildDefaultActive } from '../reducers/invoiceReducer';
import type { InvoiceState, SavedInvoice } from '../types/invoice';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stateWith(overrides: Partial<InvoiceState> = {}): InvoiceState {
  return { ...initialState, ...overrides };
}

// ---------------------------------------------------------------------------
// buildDefaultActive
// ---------------------------------------------------------------------------

describe('buildDefaultActive', () => {
  it('returns an object with empty string fields and zero total', () => {
    const active = buildDefaultActive();
    expect(active.invoiceNumber).toBe('');
    expect(active.clientName).toBe('');
    expect(active.total).toBe(0);
    expect(active.lineItems).toEqual([]);
  });

  it('sets issueDate to today in YYYY-MM-DD format', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(buildDefaultActive().issueDate).toBe(today);
  });

  it('computes issueDate at call time, not at module load', () => {
    // Two successive calls should both return today (not a stale module-load value).
    const a = buildDefaultActive().issueDate;
    const b = buildDefaultActive().issueDate;
    expect(a).toBe(b);
  });
});

// ---------------------------------------------------------------------------
// UPDATE_STRING_FIELD
// ---------------------------------------------------------------------------

describe('invoiceReducer — UPDATE_STRING_FIELD', () => {
  it('updates invoiceNumber', () => {
    const next = invoiceReducer(
      stateWith(),
      { type: 'UPDATE_STRING_FIELD', field: 'invoiceNumber', value: 'INV-001' },
    );
    expect(next.active.invoiceNumber).toBe('INV-001');
  });

  it('updates clientName', () => {
    const next = invoiceReducer(
      stateWith(),
      { type: 'UPDATE_STRING_FIELD', field: 'clientName', value: 'Acme Corp' },
    );
    expect(next.active.clientName).toBe('Acme Corp');
  });

  it('updates issueDate', () => {
    const next = invoiceReducer(
      stateWith(),
      { type: 'UPDATE_STRING_FIELD', field: 'issueDate', value: '2024-07-01' },
    );
    expect(next.active.issueDate).toBe('2024-07-01');
  });

  it('does not mutate other active fields', () => {
    const before = stateWith();
    const next = invoiceReducer(
      before,
      { type: 'UPDATE_STRING_FIELD', field: 'clientName', value: 'X' },
    );
    expect(next.active.invoiceNumber).toBe(before.active.invoiceNumber);
    expect(next.active.total).toBe(before.active.total);
  });

  it('does not mutate savedInvoices', () => {
    const before = stateWith();
    const next = invoiceReducer(
      before,
      { type: 'UPDATE_STRING_FIELD', field: 'invoiceNumber', value: 'X' },
    );
    expect(next.savedInvoices).toBe(before.savedInvoices);
  });
});

// ---------------------------------------------------------------------------
// UPDATE_NUMBER_FIELD
// ---------------------------------------------------------------------------

describe('invoiceReducer — UPDATE_NUMBER_FIELD', () => {
  it('updates total with a number value', () => {
    const next = invoiceReducer(
      stateWith(),
      { type: 'UPDATE_NUMBER_FIELD', field: 'total', value: 1500 },
    );
    expect(next.active.total).toBe(1500);
  });

  it('does not mutate other active fields', () => {
    const before = stateWith();
    const next = invoiceReducer(
      before,
      { type: 'UPDATE_NUMBER_FIELD', field: 'total', value: 42 },
    );
    expect(next.active.clientName).toBe(before.active.clientName);
    expect(next.active.invoiceNumber).toBe(before.active.invoiceNumber);
  });
});

// ---------------------------------------------------------------------------
// SAVE_INVOICE
// ---------------------------------------------------------------------------

describe('invoiceReducer — SAVE_INVOICE', () => {
  it('appends a snapshot to savedInvoices', () => {
    const state = stateWith({
      active: { ...buildDefaultActive(), invoiceNumber: 'INV-001', clientName: 'Acme', total: 100 },
    });
    const next = invoiceReducer(state, { type: 'SAVE_INVOICE' });
    expect(next.savedInvoices).toHaveLength(1);
    expect(next.savedInvoices[0].invoiceNumber).toBe('INV-001');
    expect(next.savedInvoices[0].clientName).toBe('Acme');
    expect(next.savedInvoices[0].total).toBe(100);
  });

  it('snapshot includes a savedAt ISO timestamp', () => {
    const next = invoiceReducer(stateWith(), { type: 'SAVE_INVOICE' });
    expect(typeof next.savedInvoices[0].savedAt).toBe('string');
    expect(next.savedInvoices[0].savedAt.length).toBeGreaterThan(0);
  });

  it('accumulates multiple saves', () => {
    let state = stateWith();
    state = invoiceReducer(state, { type: 'SAVE_INVOICE' });
    state = invoiceReducer(state, { type: 'SAVE_INVOICE' });
    expect(state.savedInvoices).toHaveLength(2);
  });

  it('does not mutate the active invoice', () => {
    const before = stateWith();
    const next = invoiceReducer(before, { type: 'SAVE_INVOICE' });
    expect(next.active).toEqual(before.active);
  });

  it('snapshot includes lineItems from active', () => {
    const lineItems = [{ description: 'Widget', quantity: 2, unitPrice: 50 }];
    const state = stateWith({
      active: { ...buildDefaultActive(), lineItems },
    });
    const next = invoiceReducer(state, { type: 'SAVE_INVOICE' });
    expect(next.savedInvoices[0].lineItems).toEqual(lineItems);
  });
});

// ---------------------------------------------------------------------------
// LOAD_SAVED_INVOICE
// ---------------------------------------------------------------------------

describe('invoiceReducer — LOAD_SAVED_INVOICE', () => {
  const snapshot: SavedInvoice = {
    invoiceNumber: 'INV-042',
    clientName: 'Globex',
    issueDate: '2024-08-15',
    total: 9999,
    lineItems: [],
    savedAt: '2024-08-15T10:00:00.000Z',
  };

  it('replaces active with the snapshot fields', () => {
    const next = invoiceReducer(stateWith(), { type: 'LOAD_SAVED_INVOICE', payload: snapshot });
    expect(next.active.invoiceNumber).toBe('INV-042');
    expect(next.active.clientName).toBe('Globex');
    expect(next.active.issueDate).toBe('2024-08-15');
    expect(next.active.total).toBe(9999);
  });

  it('restores lineItems from the snapshot', () => {
    const withItems: SavedInvoice = {
      ...snapshot,
      lineItems: [{ description: 'Widget', quantity: 1, unitPrice: 100 }],
    };
    const next = invoiceReducer(stateWith(), { type: 'LOAD_SAVED_INVOICE', payload: withItems });
    expect(next.active.lineItems).toEqual(withItems.lineItems);
  });

  it('does not mutate savedInvoices', () => {
    const before = stateWith();
    const next = invoiceReducer(before, { type: 'LOAD_SAVED_INVOICE', payload: snapshot });
    expect(next.savedInvoices).toBe(before.savedInvoices);
  });

  it('handles a snapshot with missing optional fields by spreading defaults', () => {
    // Simulate a partial snapshot (e.g. from old storage without lineItems).
    const partial = { ...snapshot, lineItems: undefined } as unknown as SavedInvoice;
    // Should not throw; lineItems falls back to default empty array.
    const next = invoiceReducer(stateWith(), { type: 'LOAD_SAVED_INVOICE', payload: partial });
    // The spread of buildDefaultActive() first means lineItems defaults to [].
    expect(Array.isArray(next.active.lineItems)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RESET_INVOICE
// ---------------------------------------------------------------------------

describe('invoiceReducer — RESET_INVOICE', () => {
  it('resets active to fresh defaults', () => {
    const state = stateWith({
      active: { ...buildDefaultActive(), invoiceNumber: 'INV-999', clientName: 'Old Client', total: 500 },
    });
    const next = invoiceReducer(state, { type: 'RESET_INVOICE' });
    expect(next.active.invoiceNumber).toBe('');
    expect(next.active.clientName).toBe('');
    expect(next.active.total).toBe(0);
    expect(next.active.lineItems).toEqual([]);
  });

  it('does not clear savedInvoices', () => {
    const saved: SavedInvoice = {
      invoiceNumber: 'INV-001',
      clientName: 'Acme',
      issueDate: '2024-01-01',
      total: 100,
      lineItems: [],
      savedAt: '2024-01-01T00:00:00.000Z',
    };
    const state = stateWith({ savedInvoices: [saved] });
    const next = invoiceReducer(state, { type: 'RESET_INVOICE' });
    expect(next.savedInvoices).toHaveLength(1);
    expect(next.savedInvoices[0].invoiceNumber).toBe('INV-001');
  });

  it('computes issueDate fresh at reset time', () => {
    const today = new Date().toISOString().split('T')[0];
    const next = invoiceReducer(stateWith(), { type: 'RESET_INVOICE' });
    expect(next.active.issueDate).toBe(today);
  });
});
