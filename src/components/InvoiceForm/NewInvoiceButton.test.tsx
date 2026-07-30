import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InvoiceProvider, useInvoice } from '../../context/InvoiceContext';
import { NewInvoiceButton } from './NewInvoiceButton';
import { INVOICE_STORAGE_KEY } from '../../context/invoiceStorage';

// Helper: renders NewInvoiceButton inside InvoiceProvider.
function renderButton() {
  return render(
    <InvoiceProvider>
      <NewInvoiceButton />
    </InvoiceProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('NewInvoiceButton', () => {
  it('renders a button with text "New Invoice"', () => {
    const { container } = renderButton();
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toBe('New Invoice');
  });

  it('calls window.confirm when clicked', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { container } = renderButton();
    fireEvent.click(container.querySelector('button')!);
    expect(confirmSpy).toHaveBeenCalledOnce();
  });

  it('does NOT dispatch RESET_INVOICE when user cancels confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    // Pre-populate storage so we can verify it is untouched.
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ senderName: 'Keep Me' }));
    const { container } = renderButton();
    fireEvent.click(container.querySelector('button')!);
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).not.toBeNull();
  });

  it('calls localStorage.removeItem with INVOICE_STORAGE_KEY when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ senderName: 'Gone' }));
    const { container } = renderButton();
    fireEvent.click(container.querySelector('button')!);
    expect(removeSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);
  });

  it('removes the localStorage key (not overwrites) when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ senderName: 'Gone' }));
    const { container } = renderButton();
    fireEvent.click(container.querySelector('button')!);
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).toBeNull();
  });

  it('confirm dialog message mentions clearing data', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { container } = renderButton();
    fireEvent.click(container.querySelector('button')!);
    expect(confirmSpy).toHaveBeenCalledWith(
      'Start a new invoice? All current data will be cleared.',
    );
  });

  it('has className btn-danger', () => {
    const { container } = renderButton();
    const btn = container.querySelector('button');
    expect(btn!.className).toContain('btn-danger');
  });

  it('does not write a blank state to localStorage after reset (persistence guard)', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { container } = renderButton();
    // Trigger a normal action first so storage has data, then reset.
    fireEvent.click(container.querySelector('button')!);
    setSpy.mockClear(); // clear calls from before the reset
    // After reset, setItem must NOT be called with the invoice key.
    const invoiceSetCalls = setSpy.mock.calls.filter(([key]) => key === INVOICE_STORAGE_KEY);
    expect(invoiceSetCalls.length).toBe(0);
  });
});
