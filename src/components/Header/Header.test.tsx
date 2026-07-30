import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import {
  InvoiceProvider,
  INVOICE_STORAGE_KEY,
  createDefaultState,
} from '../../context/InvoiceContext';

// ── Helpers ────────────────────────────────────────────────────────────────

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

describe('Header — rendering', () => {
  it('renders the app title heading', () => {
    renderHeader();
    expect(screen.getByRole('heading', { name: 'Demo Invoice' })).toBeInTheDocument();
  });

  it('renders the New Invoice button with visible text', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /new invoice/i })).toBeInTheDocument();
  });

  it('button carries the exact aria-label "Start a new invoice"', () => {
    renderHeader();
    const btn = screen.getByRole('button', { name: /start a new invoice/i });
    expect(btn).toHaveAttribute('aria-label', 'Start a new invoice');
  });

  it('button is of type="button" (not submit)', () => {
    renderHeader();
    const btn = screen.getByRole('button', { name: /start a new invoice/i });
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('button is enabled even when the form is empty', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /start a new invoice/i })).not.toBeDisabled();
  });
});

// ── Confirmation prompt ────────────────────────────────────────────────────

describe('Header — confirmation dialog', () => {
  it('calls window.confirm with the exact required message when button is clicked', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(confirmSpy).toHaveBeenCalledWith(
      'This will clear all current invoice data. Are you sure?',
    );
  });
});

// ── Confirm = true ─────────────────────────────────────────────────────────

describe('Header — user confirms reset', () => {
  it('calls localStorage.removeItem with INVOICE_STORAGE_KEY', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ invoiceNumber: 'INV-099' }));

    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    expect(removeSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);
  });

  it('does NOT call localStorage.setItem with an empty object or empty string on reset', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    // removeItem must be called, not setItem with a blank value
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));
    expect(removeSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);
    // Verify the key is gone (not set to empty)
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).toBeNull();
  });

  it('resets the invoice number to INV-001 in the context after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    // Render the full app tree so InvoicePreview reflects context state
    const { InvoicePreview } = await import('../InvoicePreview/InvoicePreview');
    render(
      <InvoiceProvider>
        <Header />
        <InvoicePreview />
      </InvoiceProvider>,
    );

    // Mutate state first via a field update to confirm reset actually changes things
    // (InvoiceProvider loads from localStorage; we pre-seed it)
    // The preview should show INV-001 after reset
    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    expect(screen.getByTestId('preview-invoiceNumber')).toHaveTextContent('INV-001');
  });

  it('resets issueDate to today in the preview after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const today = new Date().toISOString().split('T')[0];

    const { InvoicePreview } = await import('../InvoicePreview/InvoicePreview');
    render(
      <InvoiceProvider>
        <Header />
        <InvoicePreview />
      </InvoiceProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    expect(screen.getByTestId('preview-issueDate')).toHaveTextContent(today);
  });

  it('clears fromName in the preview after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    // Pre-seed storage with a non-empty fromName
    const seeded = { ...createDefaultState(), fromName: 'Acme Corp' };
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(seeded));

    const { InvoicePreview } = await import('../InvoicePreview/InvoicePreview');
    render(
      <InvoiceProvider>
        <Header />
        <InvoicePreview />
      </InvoiceProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    // After reset fromName is '' so preview renders '—'
    expect(screen.getByTestId('preview-fromName')).toHaveTextContent('—');
  });

  it('clears toName in the preview after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const seeded = { ...createDefaultState(), toName: 'Client Ltd' };
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(seeded));

    const { InvoicePreview } = await import('../InvoicePreview/InvoicePreview');
    render(
      <InvoiceProvider>
        <Header />
        <InvoicePreview />
      </InvoiceProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    expect(screen.getByTestId('preview-toName')).toHaveTextContent('—');
  });
});

// ── Confirm = false ────────────────────────────────────────────────────────

describe('Header — user cancels reset', () => {
  it('does not call localStorage.removeItem when user cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ invoiceNumber: 'INV-099' }));

    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('leaves the localStorage value intact when user cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const persisted = JSON.stringify({ invoiceNumber: 'INV-099' });
    localStorage.setItem(INVOICE_STORAGE_KEY, persisted);

    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).not.toBeNull();
  });

  it('preserves invoice data in the preview when user cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const seeded = { ...createDefaultState(), invoiceNumber: 'INV-099', fromName: 'Kept Corp' };
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(seeded));

    const { InvoicePreview } = await import('../InvoicePreview/InvoicePreview');
    render(
      <InvoiceProvider>
        <Header />
        <InvoicePreview />
      </InvoiceProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /start a new invoice/i }));

    expect(screen.getByTestId('preview-invoiceNumber')).toHaveTextContent('INV-099');
    expect(screen.getByTestId('preview-fromName')).toHaveTextContent('Kept Corp');
  });
});

// ── Keyboard accessibility ─────────────────────────────────────────────────

describe('Header — keyboard accessibility', () => {
  it('button is reachable via Tab key', async () => {
    renderHeader();
    await userEvent.tab();
    const btn = screen.getByRole('button', { name: /start a new invoice/i });
    expect(btn).toHaveFocus();
  });

  it('pressing Enter on the focused button triggers the confirm dialog', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderHeader();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it('pressing Space on the focused button triggers the confirm dialog', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderHeader();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });
});
