import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceForm } from '../components/InvoiceForm';
import { INVOICE_STORAGE_KEY, INVOICE_HISTORY_KEY } from '../services/invoiceStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

function renderForm(onSaved = vi.fn()) {
  return render(
    <InvoiceProvider>
      <InvoiceForm onSaved={onSaved} />
    </InvoiceProvider>
  );
}

beforeEach(() => {
  localStorageMock.clear();
});

describe('InvoiceForm', () => {
  it('renders invoice number field', () => {
    renderForm();
    expect(screen.getByLabelText(/invoice number/i)).toBeTruthy();
  });

  it('renders Save Invoice button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /save invoice/i })).toBeTruthy();
  });

  it('renders New Invoice button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /new invoice/i })).toBeTruthy();
  });

  it('saves invoice to history on Save Invoice click', () => {
    const onSaved = vi.fn();
    renderForm(onSaved);

    const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
    fireEvent.change(invoiceNumberInput, { target: { value: 'INV-001' } });

    const saveButton = screen.getByRole('button', { name: /save invoice/i });
    fireEvent.click(saveButton);

    expect(onSaved).toHaveBeenCalledTimes(1);

    const stored = localStorageMock.getItem(INVOICE_HISTORY_KEY);
    expect(stored).not.toBeNull();
    const history = JSON.parse(stored!);
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(1);
    expect(history[0].snapshot.invoiceNumber).toBe('INV-001');
  });

  it('persists active invoice to localStorage on field change', () => {
    renderForm();
    const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
    fireEvent.change(invoiceNumberInput, { target: { value: 'INV-002' } });

    const stored = localStorageMock.getItem(INVOICE_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const active = JSON.parse(stored!);
    expect(active.invoiceNumber).toBe('INV-002');
  });

  it('New Invoice clears active invoice but not history', () => {
    renderForm();

    // Save an invoice first
    const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
    fireEvent.change(invoiceNumberInput, { target: { value: 'INV-003' } });
    const saveButton = screen.getByRole('button', { name: /save invoice/i });
    fireEvent.click(saveButton);

    // Verify history has an entry
    const historyBefore = JSON.parse(localStorageMock.getItem(INVOICE_HISTORY_KEY)!);
    expect(historyBefore.length).toBe(1);

    // Click New Invoice
    const newButton = screen.getByRole('button', { name: /new invoice/i });
    fireEvent.click(newButton);

    // Active invoice key should be removed
    expect(localStorageMock.getItem(INVOICE_STORAGE_KEY)).toBeNull();

    // History should be untouched
    const historyAfter = JSON.parse(localStorageMock.getItem(INVOICE_HISTORY_KEY)!);
    expect(historyAfter.length).toBe(1);
  });
});
