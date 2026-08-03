import { describe, it, expect, beforeEach } from 'vitest';
import {
  INVOICE_STORAGE_KEY,
  INVOICE_HISTORY_KEY,
  loadActiveInvoice,
  saveActiveInvoice,
  clearActiveInvoice,
  loadInvoiceHistory,
  appendInvoiceHistory,
} from '../services/invoiceStorage';
import type { InvoiceState, SavedInvoiceEntry } from '../types/invoice';

const baseState: InvoiceState = {
  invoiceNumber: 'INV-001',
  issueDate: '2024-01-15',
  dueDate: '2024-02-15',
  from: 'Acme Corp',
  to: 'Client Ltd',
  lineItems: [],
};

function makeEntry(overrides: Partial<SavedInvoiceEntry> = {}): SavedInvoiceEntry {
  return {
    id: 'test-id-1',
    label: 'INV-001 — 2024-01-15',
    savedAt: '2024-01-15T10:00:00.000Z',
    snapshot: { ...baseState },
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('loadInvoiceHistory', () => {
  it('returns [] when localStorage is empty', () => {
    expect(loadInvoiceHistory()).toEqual([]);
  });

  it('returns [] when INVOICE_HISTORY_KEY contains malformed JSON', () => {
    localStorage.setItem(INVOICE_HISTORY_KEY, '{not valid json}');
    expect(loadInvoiceHistory()).toEqual([]);
  });
});

describe('appendInvoiceHistory', () => {
  it('appends an entry to an empty history', () => {
    const entry = makeEntry();
    appendInvoiceHistory(entry);
    const history = loadInvoiceHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(entry);
  });

  it('appends without overwriting existing entries', () => {
    const entry1 = makeEntry({ id: 'id-1', label: 'INV-001 — 2024-01-15' });
    const entry2 = makeEntry({ id: 'id-2', label: 'INV-002 — 2024-02-01' });
    appendInvoiceHistory(entry1);
    appendInvoiceHistory(entry2);
    const history = loadInvoiceHistory();
    expect(history).toHaveLength(2);
    expect(history[0].id).toBe('id-1');
    expect(history[1].id).toBe('id-2');
  });

  it('saving twice creates two distinct entries', () => {
    const entry1 = makeEntry({ id: 'id-a' });
    const entry2 = makeEntry({ id: 'id-b' });
    appendInvoiceHistory(entry1);
    appendInvoiceHistory(entry2);
    const history = loadInvoiceHistory();
    expect(history).toHaveLength(2);
    expect(history[0].id).not.toBe(history[1].id);
  });
});

describe('clearActiveInvoice', () => {
  it('removes INVOICE_STORAGE_KEY but leaves INVOICE_HISTORY_KEY intact', () => {
    saveActiveInvoice(baseState);
    appendInvoiceHistory(makeEntry());

    clearActiveInvoice();

    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(INVOICE_HISTORY_KEY)).not.toBeNull();
    expect(loadInvoiceHistory()).toHaveLength(1);
  });
});

describe('loadActiveInvoice', () => {
  it('returns null when key is missing', () => {
    expect(loadActiveInvoice()).toBeNull();
  });

  it('returns null when data is malformed JSON', () => {
    localStorage.setItem(INVOICE_STORAGE_KEY, 'not-json');
    expect(loadActiveInvoice()).toBeNull();
  });

  it('returns the saved state when data is valid', () => {
    saveActiveInvoice(baseState);
    expect(loadActiveInvoice()).toEqual(baseState);
  });
});
