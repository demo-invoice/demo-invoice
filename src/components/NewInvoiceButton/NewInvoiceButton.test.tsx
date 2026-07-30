import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NewInvoiceButton } from './NewInvoiceButton';
import {
  InvoiceProvider,
  INVOICE_STORAGE_KEY,
  makeDefaultState,
  useInvoice,
} from '../../context/InvoiceContext';

// ---------------------------------------------------------------------------
// Helper: a small component that exposes context state for assertions
// ---------------------------------------------------------------------------
function StateInspector() {
  const { state } = useInvoice();
  return (
    <div>
      <span data-testid="issueDate">{state.issueDate}</span>
      <span data-testid="lastAction">{state._lastAction ?? 'none'}</span>
      <span data-testid="fromName">{state.fromName}</span>
    </div>
  );
}

function Wrapper() {
  return (
    <InvoiceProvider>
      <StateInspector />
      <NewInvoiceButton />
    </InvoiceProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NewInvoiceButton', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // (a) clicking the button calls localStorage.removeItem(INVOICE_STORAGE_KEY)
  it('calls localStorage.removeItem with INVOICE_STORAGE_KEY on click', () => {
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    render(<Wrapper />);

    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    expect(removeSpy).toHaveBeenCalledWith(INVOICE_STORAGE_KEY);
  });

  // (a) clicking the button does NOT call localStorage.setItem with an empty object
  it('does NOT call localStorage.setItem with an empty-object payload after reset', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    render(<Wrapper />);

    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    // setItem should never be called with the storage key immediately after reset
    const callsWithKey = setSpy.mock.calls.filter(
      ([key]) => key === INVOICE_STORAGE_KEY,
    );
    expect(callsWithKey).toHaveLength(0);
  });

  // (b) issueDate reflects the current date at reset time (makeDefaultState called at dispatch time)
  it('sets issueDate to the current date at reset time, not module-load time', () => {
    // Freeze toISOString to a known date string
    const FIXED_DATE = '2024-06-15T00:00:00.000Z';
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(FIXED_DATE);

    render(<Wrapper />);

    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    // makeDefaultState() slices the first 10 chars of toISOString()
    expect(screen.getByTestId('issueDate').textContent).toBe(
      FIXED_DATE.slice(0, 10),
    );
  });

  // (c) the persistence useEffect guard prevents a spurious localStorage write after reset
  it('does not write to localStorage immediately after reset (_lastAction guard)', () => {
    // Pre-populate localStorage so there is something to clear
    localStorage.setItem(
      INVOICE_STORAGE_KEY,
      JSON.stringify({ ...makeDefaultState(), fromName: 'Acme Corp' }),
    );

    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    render(<Wrapper />);

    // Sanity: pre-reset state has fromName
    expect(screen.getByTestId('fromName').textContent).toBe('Acme Corp');

    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    // After reset the _lastAction guard must prevent any setItem call
    expect(setSpy).not.toHaveBeenCalledWith(
      INVOICE_STORAGE_KEY,
      expect.any(String),
    );
  });

  // Verify _lastAction is RESET_INVOICE after clicking
  it('dispatches RESET_INVOICE so _lastAction becomes RESET_INVOICE', () => {
    render(<Wrapper />);

    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    expect(screen.getByTestId('lastAction').textContent).toBe('RESET_INVOICE');
  });
});
