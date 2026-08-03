import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App';

// ---------------------------------------------------------------------------
// localStorage stub
// ---------------------------------------------------------------------------

const localStorageStore: Record<string, string> = {};

beforeEach(() => {
  // Clear store between tests.
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
// Tests
// ---------------------------------------------------------------------------

describe('InvoiceHistory integration', () => {
  it('shows empty-state message when no invoices are saved', () => {
    render(<App />);
    expect(
      screen.getByText(
        'No saved invoices yet. Click "Save Invoice" to save the current invoice.',
      ),
    ).toBeInTheDocument();
  });

  it('saves an invoice and shows it in history', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Invoice Number'), {
      target: { value: 'INV-001' },
    });
    fireEvent.change(screen.getByLabelText('Client Name'), {
      target: { value: 'Acme Corp' },
    });
    fireEvent.change(screen.getByLabelText('Issue Date'), {
      target: { value: '2024-07-01' },
    });
    fireEvent.change(screen.getByLabelText('Total'), {
      target: { value: '1500' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));

    // Entry appears in history.
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    expect(screen.getByText(/2024-07-01/)).toBeInTheDocument();

    // Empty-state message is gone.
    expect(
      screen.queryByText(
        'No saved invoices yet. Click "Save Invoice" to save the current invoice.',
      ),
    ).not.toBeInTheDocument();
  });

  it('loads a saved invoice back into the form', () => {
    render(<App />);

    // Fill and save.
    fireEvent.change(screen.getByLabelText('Invoice Number'), {
      target: { value: 'INV-042' },
    });
    fireEvent.change(screen.getByLabelText('Client Name'), {
      target: { value: 'Globex' },
    });
    fireEvent.change(screen.getByLabelText('Issue Date'), {
      target: { value: '2024-08-15' },
    });
    fireEvent.change(screen.getByLabelText('Total'), {
      target: { value: '9999' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));

    // Reset the form.
    fireEvent.click(screen.getByRole('button', { name: 'New Invoice' }));

    // Verify form is cleared.
    expect((screen.getByLabelText('Invoice Number') as HTMLInputElement).value).toBe('');

    // Load the saved invoice.
    fireEvent.click(screen.getByRole('button', { name: 'Load invoice INV-042' }));

    // Form fields should be restored.
    expect((screen.getByLabelText('Invoice Number') as HTMLInputElement).value).toBe('INV-042');
    expect((screen.getByLabelText('Client Name') as HTMLInputElement).value).toBe('Globex');
    expect((screen.getByLabelText('Issue Date') as HTMLInputElement).value).toBe('2024-08-15');
    expect((screen.getByLabelText('Total') as HTMLInputElement).value).toBe('9999');
  });
});
