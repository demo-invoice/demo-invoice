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
});
