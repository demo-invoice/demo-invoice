import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { INVOICE_STORAGE_KEY, createDefaultState } from '../../constants/invoice';
import type { InvoiceState } from '../../types/invoice';

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

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders the New Invoice button', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /new invoice/i })).toBeInTheDocument();
  });

  it('renders the app title "Invoice App"', () => {
    renderHeader();
    expect(screen.getByText('Invoice App')).toBeInTheDocument();
  });

  it('New Invoice button has aria-label "Start a new invoice"', () => {
    renderHeader();
    expect(
      screen.getByRole('button', { name: 'Start a new invoice' }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Confirm dialog
  // -------------------------------------------------------------------------

  it('calls window.confirm with the exact message on button click', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(confirmSpy).toHaveBeenCalledWith(
      'Start a new invoice? All current data will be cleared.',
    );
  });

  // -------------------------------------------------------------------------
  // Cancel path — zero side effects
  // -------------------------------------------------------------------------

  it('does NOT call localStorage.removeItem when user cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('preserves localStorage data when user cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const saved: InvoiceState = { ...createDefaultState(), invoiceNumber: 'INV-KEEP', _lastAction: '' };
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(saved));
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).not.toBeNull();
    const parsed = JSON.parse(localStorage.getItem(INVOICE_STORAGE_KEY)!) as InvoiceState;
    expect(parsed.invoiceNumber).toBe('INV-KEEP');
  });

  // -------------------------------------------------------------------------
  // Confirm path — removeItem called exactly once, then RESET_INVOICE
  // -------------------------------------------------------------------------

  it('calls localStorage.removeItem exactly once with INVOICE_STORAGE_KEY when user confirms', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    renderHeader();
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    });
    const invoiceRemoveCalls = removeSpy.mock.calls.filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    );
    expect(invoiceRemoveCalls).toHaveLength(1);
  });

  it('localStorage key is absent after user confirms (RESET_INVOICE dispatched, setItem skipped)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const saved: InvoiceState = { ...createDefaultState(), invoiceNumber: 'INV-OLD', _lastAction: '' };
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(saved));
    renderHeader();
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    });
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).toBeNull();
  });

  it('removeItem is called before (or without) any subsequent setItem on confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const callOrder: string[] = [];
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(function (key: string) {
      if (key === INVOICE_STORAGE_KEY) callOrder.push('removeItem');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key: string) {
      if (key === INVOICE_STORAGE_KEY) callOrder.push('setItem');
    });
    renderHeader();
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    });
    // removeItem must appear exactly once; setItem must NOT appear after reset.
    expect(callOrder.filter((c) => c === 'removeItem')).toHaveLength(1);
    expect(callOrder.filter((c) => c === 'setItem')).toHaveLength(0);
  });
});
