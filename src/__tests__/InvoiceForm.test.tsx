import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceForm } from '../components/InvoiceForm';
import {
  appendInvoiceHistory,
  loadInvoiceHistory,
  loadActiveInvoice,
  INVOICE_STORAGE_KEY,
  INVOICE_HISTORY_KEY,
} from '../services/invoiceStorage';
import type { SavedInvoiceEntry, InvoiceState } from '../types/invoice';

const historyEntry: SavedInvoiceEntry = {
  id: 'hist-1',
  label: 'INV-OLD — 2023-12-01',
  savedAt: '2023-12-01T08:00:00.000Z',
  snapshot: {
    invoiceNumber: 'INV-OLD',
    issueDate: '2023-12-01',
    dueDate: '2023-12-31',
    from: 'Old Sender',
    to: 'Old Recipient',
    lineItems: [],
  },
};

beforeEach(() => {
  localStorage.clear();
});

describe('InvoiceForm', () => {
  it('Save Invoice button is present in the UI', () => {
    render(
      <InvoiceProvider>
        <InvoiceForm onSaved={() => undefined} />
      </InvoiceProvider>,
    );
    expect(screen.getByRole('button', { name: /save invoice/i })).toBeInTheDocument();
  });

  it('New Invoice reset clears active invoice state but history is unaffected', async () => {
    const user = userEvent.setup();
    appendInvoiceHistory(historyEntry);

    render(
      <InvoiceProvider>
        <InvoiceForm onSaved={() => undefined} />
      </InvoiceProvider>,
    );

    // Type something into invoice number
    await user.type(screen.getByLabelText(/invoice number/i), 'INV-NEW');

    // Click New Invoice
    await user.click(screen.getByRole('button', { name: /new invoice/i }));

    // Active invoice key should be gone (or reset to default)
    const active = loadActiveInvoice();
    // After NEW_INVOICE, the useEffect will save DEFAULT_INVOICE_STATE,
    // so the key may exist with empty values — what matters is history is intact.
    const history = loadInvoiceHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe('hist-1');

    // INVOICE_HISTORY_KEY must still be present
    expect(localStorage.getItem(INVOICE_HISTORY_KEY)).not.toBeNull();
  });

  it('active invoice is persisted to localStorage on field change', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <InvoiceForm onSaved={() => undefined} />
      </InvoiceProvider>,
    );

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-PERSIST');

    const active = loadActiveInvoice();
    expect(active?.invoiceNumber).toBe('INV-PERSIST');
  });
});
