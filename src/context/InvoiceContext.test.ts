import { describe, it, expect } from 'vitest';
import { invoiceReducer } from './InvoiceContext';
import { createDefaultState } from '../../constants/invoice';

describe('invoiceReducer', () => {
  it('returns default state for unknown action', () => {
    const state = createDefaultState();
    const next = invoiceReducer(state, { type: '__UNKNOWN__' } as never);
    expect(next).toBe(state);
  });

  it('resets to default state on RESET_INVOICE and invoiceNumber is INV-001', () => {
    const dirty = {
      ...createDefaultState(),
      invoiceNumber: 'INV-099',
      fromName: 'Acme Corp',
    };

    const next = invoiceReducer(dirty, { type: 'RESET_INVOICE' });

    expect(next.invoiceNumber).toBe('INV-001');
    expect(next.fromName).toBe('');
  });

  it('createDefaultState returns invoiceNumber INV-001', () => {
    const state = createDefaultState();
    expect(state.invoiceNumber).toBe('INV-001');
  });

  it('createDefaultState computes issueDate at call time (not a stale module-level constant)', () => {
    const before = new Date().toISOString().slice(0, 10);
    const state = createDefaultState();
    const after = new Date().toISOString().slice(0, 10);
    // issueDate must be today's date (between before and after)
    expect(state.issueDate >= before).toBe(true);
    expect(state.issueDate <= after).toBe(true);
  });

  it('RESET_INVOICE produces a fresh issueDate equal to today', () => {
    const dirty = { ...createDefaultState(), issueDate: '2000-01-01' };
    const today = new Date().toISOString().slice(0, 10);
    const next = invoiceReducer(dirty, { type: 'RESET_INVOICE' });
    expect(next.issueDate).toBe(today);
  });
});
