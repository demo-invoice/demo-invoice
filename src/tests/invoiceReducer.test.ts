import { describe, it, expect, beforeEach } from 'vitest';
import {
  invoiceReducer,
  buildDefaultActive,
  loadInitialState,
  ACTIVE_KEY,
  HISTORY_KEY,
} from '../reducers/invoiceReducer';
import type { InvoiceState, SavedInvoice } from '../types/invoice';

function makeState(overrides?: Partial<InvoiceState>): InvoiceState {
  return {
    active: buildDefaultActive(),
    history: [],
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('invoiceReducer', () => {
  describe('UPDATE_FIELD', () => {
    it('updates a string field on the active invoice', () => {
      const state = makeState();
      const next = invoiceReducer(state, {
        type: 'UPDATE_FIELD',
        field: 'invoiceNumber',
        value: 'INV-001',
      });
      expect(next.active.invoiceNumber).toBe('INV-001');
    });

    it('updates the numeric total field', () => {
      const state = makeState();
      const next = invoiceReducer(state, {
        type: 'UPDATE_FIELD',
        field: 'total',
        value: 1500,
      });
      expect(next.active.total).toBe(1500);
    });

    it('does not mutate other active fields', () => {
      const state = makeState();
      const next = invoiceReducer(state, {
        type: 'UPDATE_FIELD',
        field: 'clientName',
        value: 'Acme',
      });
      expect(next.active.invoiceNumber).toBe(state.active.invoiceNumber);
      expect(next.active.total).toBe(state.active.total);
    });

    it('persists active invoice to localStorage', () => {
      const state = makeState();
      invoiceReducer(state, {
        type: 'UPDATE_FIELD',
        field: 'clientName',
        value: 'Stored',
      });
      const raw = localStorage.getItem(ACTIVE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!) as { clientName: string };
      expect(parsed.clientName).toBe('Stored');
    });
  });

  describe('SAVE_INVOICE', () => {
    it('prepends a SavedInvoice to history', () => {
      const state = makeState({
        active: { invoiceNumber: 'INV-001', clientName: 'Acme', issueDate: '2024-07-01', total: 500 },
      });
      const next = invoiceReducer(state, { type: 'SAVE_INVOICE' });
      expect(next.history).toHaveLength(1);
      expect(next.history[0].invoiceNumber).toBe('INV-001');
      expect(next.history[0].clientName).toBe('Acme');
      expect(next.history[0].total).toBe(500);
    });

    it('saved entry includes a savedAt timestamp string', () => {
      const state = makeState();
      const next = invoiceReducer(state, { type: 'SAVE_INVOICE' });
      expect(typeof next.history[0].savedAt).toBe('string');
      expect(next.history[0].savedAt.length).toBeGreaterThan(0);
    });

    it('new saves are prepended (most recent first)', () => {
      let state = makeState({
        active: { invoiceNumber: 'INV-A', clientName: '', issueDate: '', total: 0 },
      });
      state = invoiceReducer(state, { type: 'SAVE_INVOICE' });
      state = {
        ...state,
        active: { invoiceNumber: 'INV-B', clientName: '', issueDate: '', total: 0 },
      };
      state = invoiceReducer(state, { type: 'SAVE_INVOICE' });
      expect(state.history[0].invoiceNumber).toBe('INV-B');
      expect(state.history[1].invoiceNumber).toBe('INV-A');
    });

    it('persists history to localStorage', () => {
      const state = makeState({
        active: { invoiceNumber: 'INV-X', clientName: '', issueDate: '', total: 0 },
      });
      invoiceReducer(state, { type: 'SAVE_INVOICE' });
      const raw = localStorage.getItem(HISTORY_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!) as Array<{ invoiceNumber: string }>;
      expect(parsed[0].invoiceNumber).toBe('INV-X');
    });

    it('does not modify the active invoice', () => {
      const state = makeState({
        active: { invoiceNumber: 'INV-001', clientName: 'Acme', issueDate: '2024-01-01', total: 100 },
      });
      const next = invoiceReducer(state, { type: 'SAVE_INVOICE' });
      expect(next.active).toEqual(state.active);
    });
  });

  describe('RESET_INVOICE', () => {
    it('resets active invoice to default values', () => {
      const state = makeState({
        active: { invoiceNumber: 'INV-001', clientName: 'Acme', issueDate: '2024-07-01', total: 999 },
      });
      const next = invoiceReducer(state, { type: 'RESET_INVOICE' });
      expect(next.active.invoiceNumber).toBe('');
      expect(next.active.clientName).toBe('');
      expect(next.active.total).toBe(0);
    });

    it('does not clear history on reset', () => {
      const saved: SavedInvoice = {
        invoiceNumber: 'INV-001',
        clientName: 'Acme',
        issueDate: '2024-07-01',
        total: 100,
        savedAt: new Date().toISOString(),
      };
      const state = makeState({ history: [saved] });
      const next = invoiceReducer(state, { type: 'RESET_INVOICE' });
      expect(next.history).toHaveLength(1);
    });

    it('issueDate after reset is a valid date string (called at reset time)', () => {
      const state = makeState();
      const next = invoiceReducer(state, { type: 'RESET_INVOICE' });
      expect(next.active.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('LOAD_SAVED_INVOICE', () => {
    it('restores all active fields from the saved invoice', () => {
      const invoice: SavedInvoice = {
        invoiceNumber: 'INV-001',
        clientName: 'Acme Corp',
        issueDate: '2024-07-01',
        total: 1500,
        savedAt: '2024-07-01T12:00:00.000Z',
      };
      const state = makeState();
      const next = invoiceReducer(state, { type: 'LOAD_SAVED_INVOICE', invoice });
      expect(next.active.invoiceNumber).toBe('INV-001');
      expect(next.active.clientName).toBe('Acme Corp');
      expect(next.active.issueDate).toBe('2024-07-01');
      expect(next.active.total).toBe(1500);
    });

    it('does not include savedAt in the restored active invoice', () => {
      const invoice: SavedInvoice = {
        invoiceNumber: 'INV-002',
        clientName: 'Beta',
        issueDate: '2024-08-01',
        total: 200,
        savedAt: '2024-08-01T10:00:00.000Z',
      };
      const state = makeState();
      const next = invoiceReducer(state, { type: 'LOAD_SAVED_INVOICE', invoice });
      expect('savedAt' in next.active).toBe(false);
    });

    it('does not modify history on load', () => {
      const invoice: SavedInvoice = {
        invoiceNumber: 'INV-003',
        clientName: 'Gamma',
        issueDate: '2024-09-01',
        total: 300,
        savedAt: '2024-09-01T08:00:00.000Z',
      };
      const state = makeState({ history: [invoice] });
      const next = invoiceReducer(state, { type: 'LOAD_SAVED_INVOICE', invoice });
      expect(next.history).toHaveLength(1);
    });

    it('persists the loaded active invoice to localStorage', () => {
      const invoice: SavedInvoice = {
        invoiceNumber: 'INV-004',
        clientName: 'Delta',
        issueDate: '2024-10-01',
        total: 400,
        savedAt: '2024-10-01T09:00:00.000Z',
      };
      const state = makeState();
      invoiceReducer(state, { type: 'LOAD_SAVED_INVOICE', invoice });
      const raw = localStorage.getItem(ACTIVE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!) as { invoiceNumber: string; total: number };
      expect(parsed.invoiceNumber).toBe('INV-004');
      expect(parsed.total).toBe(400);
    });
  });

  describe('buildDefaultActive', () => {
    it('returns empty strings for text fields', () => {
      const d = buildDefaultActive();
      expect(d.invoiceNumber).toBe('');
      expect(d.clientName).toBe('');
    });

    it('returns 0 for total', () => {
      const d = buildDefaultActive();
      expect(d.total).toBe(0);
    });

    it('returns a YYYY-MM-DD formatted issueDate', () => {
      const d = buildDefaultActive();
      expect(d.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('loadInitialState', () => {
    it('returns defaults when localStorage is empty', () => {
      const state = loadInitialState();
      expect(state.active.invoiceNumber).toBe('');
      expect(state.history).toEqual([]);
    });

    it('restores active invoice from localStorage', () => {
      const active = { invoiceNumber: 'INV-LS', clientName: 'LS Corp', issueDate: '2024-01-01', total: 777 };
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
      const state = loadInitialState();
      expect(state.active.invoiceNumber).toBe('INV-LS');
      expect(state.active.total).toBe(777);
    });

    it('restores history from localStorage', () => {
      const history: SavedInvoice[] = [
        { invoiceNumber: 'INV-H1', clientName: 'H Corp', issueDate: '2024-02-01', total: 50, savedAt: '2024-02-01T00:00:00.000Z' },
      ];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      const state = loadInitialState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].invoiceNumber).toBe('INV-H1');
    });

    it('falls back to defaults when localStorage contains invalid JSON', () => {
      localStorage.setItem(ACTIVE_KEY, 'not-json');
      const state = loadInitialState();
      expect(state.active.invoiceNumber).toBe('');
      expect(state.history).toEqual([]);
    });
  });

  describe('localStorage keys', () => {
    it('ACTIVE_KEY is invoice_active_v1', () => {
      expect(ACTIVE_KEY).toBe('invoice_active_v1');
    });

    it('HISTORY_KEY is invoice_history_v1', () => {
      expect(HISTORY_KEY).toBe('invoice_history_v1');
    });
  });
});
