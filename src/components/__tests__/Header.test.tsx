import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../Header';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { INVOICE_STORAGE_KEY } from '../../constants/invoice';

function renderHeader() {
  return render(
    <InvoiceProvider>
      <Header />
    </InvoiceProvider>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the New Invoice button', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /new invoice/i })).toBeInTheDocument();
  });

  it('shows a confirm dialog when New Invoice is clicked', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(confirmSpy).toHaveBeenCalledWith(
      'This will clear all current invoice data. Are you sure?',
    );
  });

  it('does not remove localStorage or dispatch when user cancels', () => {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ invoiceNumber: 'INV-999' }));
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(removeSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).not.toBeNull();
  });

  it('removes localStorage and dispatches RESET_INVOICE when user confirms', () => {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ invoiceNumber: 'INV-999' }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).toBeNull();
  });
});
