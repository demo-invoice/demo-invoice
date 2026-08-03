import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from '../App';

// ---------------------------------------------------------------------------
// localStorage stub
// ---------------------------------------------------------------------------

const localStorageStore: Record<string, string> = {};

beforeEach(() => {
  Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => localStorageStore[key] ?? null,
      setItem: (key: string, value: string) => { localStorageStore[key] = value; },
      removeItem: (key: string) => { delete localStorageStore[key]; },
      clear: () => { Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]); },
    },
    writable: true,
    configurable: true,
  });
});

// ---------------------------------------------------------------------------
// InvoiceHistory — empty state
// ---------------------------------------------------------------------------

describe('InvoiceHistory — empty state', () => {
  it('renders the full empty-state message when no invoices are saved', () => {
    render(<App />);
    expect(
      screen.getByText(
        'No saved invoices yet. Click "Save Invoice" to save the current invoice.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the "Saved Invoices" heading', () => {
    render(<App />);
    expect(screen.getByText('Saved Invoices')).toBeInTheDocument();
  });

  it('empty-state message satisfies /no saved invoices/i regex', () => {
    render(<App />);
    expect(screen.getByText(/no saved invoices/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// InvoiceHistory — save flow
// ---------------------------------------------------------------------------

describe('InvoiceHistory — save flow', () => {
  it('Save Invoice button is present in the form', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Save Invoice' })).toBeInTheDocument();
  });

  it('clicking Save Invoice appends an entry to the history list', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Invoice Number'), { target: { value: 'INV-001' } });
    fireEvent.change(screen.getByLabelText('Client Name'), { target: { value: 'Acme Corp' } });
    fireEvent.change(screen.getByLabelText('Issue Date'), { target: { value: '2024-07-01' } });
    fireEvent.change(screen.getByLabelText('Total'), { target: { value: '1500' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));

    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    expect(screen.getByText(/2024-07-01/)).toBeInTheDocument();
  });

  it('empty-state message disappears after saving', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));

    expect(
      screen.queryByText(
        'No saved invoices yet. Click "Save Invoice" to save the current invoice.',
      ),
    ).not.toBeInTheDocument();
  });

  it('each saved entry has a Load button with aria-label', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Invoice Number'), { target: { value: 'INV-007' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));

    expect(
      screen.getByRole('button', { name: 'Load invoice INV-007' }),
    ).toBeInTheDocument();
  });

  it('accumulates multiple saved entries', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Invoice Number'), { target: { value: 'INV-001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));

    fireEvent.change(screen.getByLabelText('Invoice Number'), { target: { value: 'INV-002' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));

    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('INV-002')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// InvoiceHistory — load flow (full save → reset → load path)
// ---------------------------------------------------------------------------

describe('InvoiceHistory — load flow', () => {
  it('clicking Load restores all form fields to the saved values', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Invoice Number'), { target: { value: 'INV-042' } });
    fireEvent.change(screen.getByLabelText('Client Name'), { target: { value: 'Globex' } });
    fireEvent.change(screen.getByLabelText('Issue Date'), { target: { value: '2024-08-15' } });
    fireEvent.change(screen.getByLabelText('Total'), { target: { value: '9999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));

    // Reset the form.
    fireEvent.click(screen.getByRole('button', { name: 'New Invoice' }));
    expect((screen.getByLabelText('Invoice Number') as HTMLInputElement).value).toBe('');

    // Load the saved invoice.
    fireEvent.click(screen.getByRole('button', { name: 'Load invoice INV-042' }));

    expect((screen.getByLabelText('Invoice Number') as HTMLInputElement).value).toBe('INV-042');
    expect((screen.getByLabelText('Client Name') as HTMLInputElement).value).toBe('Globex');
    expect((screen.getByLabelText('Issue Date') as HTMLInputElement).value).toBe('2024-08-15');
    expect((screen.getByLabelText('Total') as HTMLInputElement).value).toBe('9999');
  });

  it('history list is still present after loading', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Invoice Number'), { target: { value: 'INV-010' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load invoice INV-010' }));

    // Entry should still be visible in history after loading.
    expect(screen.getByText('INV-010')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// InvoiceForm — New Invoice (reset)
// ---------------------------------------------------------------------------

describe('InvoiceForm — New Invoice reset', () => {
  it('New Invoice button clears the form fields', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Invoice Number'), { target: { value: 'INV-999' } });
    fireEvent.change(screen.getByLabelText('Client Name'), { target: { value: 'Old Client' } });

    fireEvent.click(screen.getByRole('button', { name: 'New Invoice' }));

    expect((screen.getByLabelText('Invoice Number') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Client Name') as HTMLInputElement).value).toBe('');
  });

  it('New Invoice does not clear the saved history list', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Invoice Number'), { target: { value: 'INV-001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));
    fireEvent.click(screen.getByRole('button', { name: 'New Invoice' }));

    expect(screen.getByText('INV-001')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

describe('localStorage persistence', () => {
  it('persists active invoice to invoice_active_v1 key', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Client Name'), { target: { value: 'Persist Co' } });

    const raw = localStorageStore['invoice_active_v1'];
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw);
    expect(parsed.clientName).toBe('Persist Co');
  });

  it('persists saved history to invoice_history_v1 key', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Invoice Number'), { target: { value: 'INV-H1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));

    const raw = localStorageStore['invoice_history_v1'];
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw) as Array<{ invoiceNumber: string }>;
    expect(parsed).toHaveLength(1);
    expect(parsed[0].invoiceNumber).toBe('INV-H1');
  });

  it('does NOT write to invoice_history_v1 key when saving active invoice only', () => {
    render(<App />);
    // Just change a field — do not click Save Invoice.
    fireEvent.change(screen.getByLabelText('Client Name'), { target: { value: 'No Save' } });

    // History key should be an empty array (initial persist), not containing any entries.
    const raw = localStorageStore['invoice_history_v1'];
    if (raw !== undefined) {
      const parsed = JSON.parse(raw) as unknown[];
      expect(parsed).toHaveLength(0);
    }
  });
});
