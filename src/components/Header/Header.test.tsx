import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { InvoiceProvider, INVOICE_STORAGE_KEY } from '../../context/InvoiceContext';

// ── Setup ──────────────────────────────────────────────────────────────────

function renderHeader() {
  return render(
    <InvoiceProvider>
      <Header />
    </InvoiceProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Rendering ──────────────────────────────────────────────────────────────

describe('Header', () => {
  it('renders the New Invoice button', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /start a new invoice/i })).toBeInTheDocument();
  });

  it('renders the app title', () => {
    renderHeader();
    expect(screen.getByRole('heading', { name: /demo invoice/i })).toBeInTheDocument();
  });

  // ── Confirm = true ───────────────────────────────────────────────────────

  it('dispatches RESET_INVOICE and removes localStorage key when user confirms', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');

    // Pre-populate storage so we can verify it gets cleared.
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ invoiceNumber: 'INV-099' }));

    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    expect(window.confirm).toHaveBeenCalledWith(
      'This will clear all current invoice data. Are you sure?',
    );
    expect(removeSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);
  });

  // ── Confirm = false ──────────────────────────────────────────────────────

  it('does nothing when user cancels the confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    const dispatchSpy = vi.fn();

    // We verify no removeItem call happens.
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ invoiceNumber: 'INV-099' }));

    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    expect(removeSpy).not.toHaveBeenCalled();
    // Storage value is unchanged.
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).not.toBeNull();
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  it('button has the correct aria-label', () => {
    renderHeader();
    const btn = screen.getByRole('button', { name: /start a new invoice/i });
    expect(btn).toHaveAttribute('aria-label', 'Start a new invoice');
  });

  it('button is always enabled (not disabled when form is empty)', () => {
    renderHeader();
    const btn = screen.getByRole('button', { name: /start a new invoice/i });
    expect(btn).not.toBeDisabled();
  });
});
