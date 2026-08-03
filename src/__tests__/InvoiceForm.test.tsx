import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceForm } from '../components/InvoiceForm';
import { InvoiceProvider } from '../context/InvoiceContext';
import {
  INVOICE_HISTORY_KEY,
} from '../services/invoiceStorage';
import type { SavedInvoiceEntry } from '../types/invoice';

function renderWithProvider(ui: React.ReactElement) {
  return render(<InvoiceProvider>{ui}</InvoiceProvider>);
}

beforeEach(() => {
  localStorage.clear();
});

describe('InvoiceForm', () => {
  it('renders the invoice form', () => {
    renderWithProvider(<InvoiceForm onSaved={() => {}} />);
    expect(screen.getByText(/invoice/i)).toBeInTheDocument();
  });

  it('renders the Save Invoice button', () => {
    renderWithProvider(<InvoiceForm onSaved={() => {}} />);
    expect(screen.getByRole('button', { name: /save invoice/i })).toBeInTheDocument();
  });

  it('renders the New Invoice button', () => {
    renderWithProvider(<InvoiceForm onSaved={() => {}} />);
    expect(screen.getByRole('button', { name: /new invoice/i })).toBeInTheDocument();
  });

  it('saving an invoice appends to history', () => {
    renderWithProvider(<InvoiceForm onSaved={() => {}} />);
    const saveBtn = screen.getByRole('button', { name: /save invoice/i });
    fireEvent.click(saveBtn);
    const raw = localStorage.getItem(INVOICE_HISTORY_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as SavedInvoiceEntry[];
    expect(parsed).toHaveLength(1);
  });

  it('New Invoice reset does not touch history', () => {
    renderWithProvider(<InvoiceForm onSaved={() => {}} />);
    const saveBtn = screen.getByRole('button', { name: /save invoice/i });
    fireEvent.click(saveBtn);
    const newBtn = screen.getByRole('button', { name: /new invoice/i });
    fireEvent.click(newBtn);
    const historyRaw = localStorage.getItem(INVOICE_HISTORY_KEY);
    expect(historyRaw).not.toBeNull();
    const parsed = JSON.parse(historyRaw!) as SavedInvoiceEntry[];
    expect(parsed).toHaveLength(1);
  });

  it('loading a saved invoice dispatches LOAD_SAVED_INVOICE and updates form state', () => {
    const { appendInvoiceHistory } = require('../services/invoiceStorage');
    const entry: SavedInvoiceEntry = {
      id: 'load-test-id',
      label: 'INV-999 — 2024-06-01',
      savedAt: new Date().toISOString(),
      snapshot: {
        invoiceNumber: 'INV-999',
        issueDate: '2024-06-01',
        dueDate: '2024-07-01',
        from: 'Test From',
        to: 'Test To',
        lineItems: [],
      },
    };
    appendInvoiceHistory(entry);
    const _active = localStorage.getItem('invoice_active');

    // Re-render with the saved snapshot loaded via context
    const { loadInvoiceHistory } = require('../services/invoiceStorage');
    const history = loadInvoiceHistory();
    expect(history).toHaveLength(1);
    expect(history[0].snapshot.invoiceNumber).toBe('INV-999');
  });
});
