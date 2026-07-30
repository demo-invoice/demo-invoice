/**
 * NewInvoiceButton tests
 *
 * Covers:
 * (a) Clicking the button calls localStorage.removeItem(INVOICE_STORAGE_KEY)
 *     and NOT localStorage.setItem with an empty/default object.
 * (b) RESET_INVOICE dispatch triggers makeDefaultState() at reset time, so
 *     the Issue Date in the resulting state is the current date.
 * (c) The _lastAction === 'RESET_INVOICE' guard in the persistence useEffect
 *     prevents a spurious localStorage.setItem after reset.
 */

import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  InvoiceProvider,
  INVOICE_STORAGE_KEY,
  makeDefaultState,
} from '../../context/InvoiceContext';
import { NewInvoiceButton } from './NewInvoiceButton';

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider() {
  return render(
    <InvoiceProvider>
      <NewInvoiceButton />
    </InvoiceProvider>,
  );
}

function clickNewInvoice() {
  fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NewInvoiceButton', () => {
  let removeItemSpy: MockInstance;
  let setItemSpy: MockInstance;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    removeItemSpy = localStorageMock.removeItem as unknown as MockInstance;
    setItemSpy = localStorageMock.setItem as unknown as MockInstance;
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders a button with text "New Invoice"', () => {
    renderWithProvider();
    expect(screen.getByRole('button', { name: 'New Invoice' })).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // (a) removeItem is called; setItem is NOT called after reset
  // -------------------------------------------------------------------------

  it('calls localStorage.removeItem(INVOICE_STORAGE_KEY) when clicked', async () => {
    renderWithProvider();
    await act(async () => { clickNewInvoice(); });
    expect(removeItemSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);
  });

  it('does NOT call localStorage.setItem after a reset', async () => {
    renderWithProvider();
    // Allow any initial-mount effects to settle.
    await act(async () => {});
    setItemSpy.mockClear();

    await act(async () => { clickNewInvoice(); });

    const setItemCallsForKey = (setItemSpy.mock.calls as [string, string][]).filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    );
    expect(setItemCallsForKey).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // (b) makeDefaultState() returns today's date at call time
  // -------------------------------------------------------------------------

  it('makeDefaultState() returns today\'s date as issueDate', () => {
    const today = new Date().toISOString().slice(0, 10);
    const defaultState = makeDefaultState();
    expect(defaultState.issueDate).toBe(today);
  });

  it('Issue Date in reset state reflects the date at reset time, not module-load time', () => {
    const futureDate = '2099-12-31';
    const OriginalDate = globalThis.Date;

    const mockDate = new OriginalDate(futureDate + 'T00:00:00.000Z');
    vi.spyOn(globalThis, 'Date').mockImplementation(
      (...args: ConstructorParameters<typeof Date>) =>
        args.length === 0
          ? (mockDate as unknown as string)
          : new OriginalDate(...args),
    );

    try {
      const defaultState = makeDefaultState();
      expect(defaultState.issueDate).toBe(futureDate);
    } finally {
      vi.restoreAllMocks();
    }
  });

  // -------------------------------------------------------------------------
  // (c) _lastAction guard prevents spurious write after RESET_INVOICE
  // -------------------------------------------------------------------------

  it('persistence effect removes the key and does not re-persist after RESET_INVOICE', async () => {
    // Pre-populate localStorage so there is something to remove.
    localStorageMock.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ invoiceNumber: 'INV-001' }));
    setItemSpy.mockClear();

    renderWithProvider();
    // Let mount effects settle (_lastAction is undefined → effect returns early).
    await act(async () => {});
    setItemSpy.mockClear();
    removeItemSpy.mockClear();

    // Trigger reset.
    await act(async () => { clickNewInvoice(); });

    // removeItem must have been called exactly once for our key.
    expect(removeItemSpy).toHaveBeenCalledTimes(1);
    expect(removeItemSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);

    // setItem must NOT have been called for our key after the reset.
    const setItemCallsForKey = (setItemSpy.mock.calls as [string, string][]).filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    );
    expect(setItemCallsForKey).toHaveLength(0);
  });

  it('does not call removeItem on initial render (no reset dispatched)', async () => {
    renderWithProvider();
    await act(async () => {});
    expect(removeItemSpy).not.toHaveBeenCalled();
  });
});
