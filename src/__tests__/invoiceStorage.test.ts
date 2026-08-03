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

// ─── loadActiveInvoice ───────────────────────────────────────────────────────

describe('loadActiveInvoice', () => {
  it('returns null when key is absent', () => {
    expect(loadActiveInvoice()).toBeNull();
  });

  it('returns null when stored value is malformed JSON', () => {
    localStorage.setItem(INVOICE_STORAGE_KEY, 'not-json');
    expect(loadActiveInvoice()).toBeNull();
  });

  it('returns the saved state when data is valid', () => {
    saveActiveInvoice(baseState);
    expect(loadActiveInvoice()).toEqual(baseState);
  });
});

// ─── saveActiveInvoice ───────────────────────────────────────────────────────

describe('saveActiveInvoice', () => {
  it('writes state to INVOICE_STORAGE_KEY', () => {
    saveActiveInvoice(baseState);
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(baseState);
  });

  it('does not touch INVOICE_HISTORY_KEY', () => {
    saveActiveInvoice(baseState);
    expect(localStorage.getItem(INVOICE_HISTORY_KEY)).toBeNull();
  });
});

// ─── clearActiveInvoice ──────────────────────────────────────────────────────

describe('clearActiveInvoice', () => {
  it('removes INVOICE_STORAGE_KEY', () => {
    saveActiveInvoice(baseState);
    clearActiveInvoice();
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).toBeNull();
  });

  it('leaves INVOICE_HISTORY_KEY intact', () => {
    saveActiveInvoice(baseState);
    appendInvoiceHistory(makeEntry());
    clearActiveInvoice();
    expect(localStorage.getItem(INVOICE_HISTORY_KEY)).not.toBeNull();
    expect(loadInvoiceHistory()).toHaveLength(1);
  });
});

// ─── loadInvoiceHistory ──────────────────────────────────────────────────────

describe('loadInvoiceHistory', () => {
  it('returns [] when localStorage is empty', () => {
    expect(loadInvoiceHistory()).toEqual([]);
  });

  it('returns [] when INVOICE_HISTORY_KEY contains malformed JSON', () => {
    localStorage.setItem(INVOICE_HISTORY_KEY, '{not valid json}');
    expect(loadInvoiceHistory()).toEqual([]);
  });

  it('returns the stored array when data is valid', () => {
    const entry = makeEntry();
    appendInvoiceHistory(entry);
    expect(loadInvoiceHistory()).toEqual([entry]);
  });
});

// ─── appendInvoiceHistory ────────────────────────────────────────────────────

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

  it('saving the same snapshot twice creates two distinct entries', () => {
    const entry1 = makeEntry({ id: 'id-a' });
    const entry2 = makeEntry({ id: 'id-b' });
    appendInvoiceHistory(entry1);
    appendInvoiceHistory(entry2);
    const history = loadInvoiceHistory();
    expect(history).toHaveLength(2);
    expect(history[0].id).not.toBe(history[1].id);
  });

  it('persists across simulated page reload (re-read from localStorage)', () => {
    const entry1 = makeEntry({ id: 'e1' });
    const entry2 = makeEntry({ id: 'e2' });
    appendInvoiceHistory(entry1);
    appendInvoiceHistory(entry2);
    // Simulate reload: call loadInvoiceHistory fresh
    const reloaded = loadInvoiceHistory();
    expect(reloaded).toHaveLength(2);
    expect(reloaded[0].id).toBe('e1');
    expect(reloaded[1].id).toBe('e2');
  });

  it('stores snapshot fields verbatim (issueDate not recomputed)', () => {
    const entry = makeEntry({ snapshot: { ...baseState, issueDate: '2024-01-15' } });
    appendInvoiceHistory(entry);
    const history = loadInvoiceHistory();
    expect(history[0].snapshot.issueDate).toBe('2024-01-15');
  });
});
