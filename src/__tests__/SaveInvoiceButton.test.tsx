import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveInvoiceButton } from '../components/SaveInvoiceButton';
import { InvoiceProvider } from '../context/InvoiceContext';
import { INVOICE_HISTORY_KEY } from '../services/invoiceStorage';
import type { SavedInvoiceEntry } from '../types/invoice';

beforeEach(() => {
  localStorage.clear();
});

function renderWithProvider(ui: React.ReactElement) {
  return render(<InvoiceProvider>{ui}</InvoiceProvider>);
}

describe('SaveInvoiceButton', () => {
  it('renders a Save Invoice button', () => {
    renderWithProvider(<SaveInvoiceButton />);
    expect(screen.getByRole('button', { name: /save invoice/i })).toBeInTheDocument();
  });

  it('appends a new entry to localStorage history on click', () => {
    renderWithProvider(<SaveInvoiceButton />);
    const btn = screen.getByRole('button', { name: /save invoice/i });
    fireEvent.click(btn);
    const raw = localStorage.getItem(INVOICE_HISTORY_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as SavedInvoiceEntry[];
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toHaveProperty('id');
    expect(parsed[0]).toHaveProperty('snapshot');
  });

  it('always appends — clicking twice creates two entries', () => {
    renderWithProvider(<SaveInvoiceButton />);
    const btn = screen.getByRole('button', { name: /save invoice/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    const parsed = JSON.parse(localStorage.getItem(INVOICE_HISTORY_KEY)!) as SavedInvoiceEntry[];
    expect(parsed).toHaveLength(2);
  });

  it('calls onSaved callback after saving', () => {
    const onSaved = vi.fn();
    renderWithProvider(<SaveInvoiceButton onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('button', { name: /save invoice/i }));
    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
