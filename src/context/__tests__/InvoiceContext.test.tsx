import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { InvoiceProvider, useInvoice, invoiceReducer } from '../InvoiceContext';
import { INVOICE_STORAGE_KEY, createDefaultState } from '../../constants/invoice';
import type { InvoiceState } from '../../types/invoice';

// ---------------------------------------------------------------------------
// Reducer unit tests
// ---------------------------------------------------------------------------

describe('invoiceReducer', () => {
  it('RESET_INVOICE returns default state with _lastAction set', () => {
    const initial: InvoiceState = { ...createDefaultState(), invoiceNumber: 'INV-999', _lastAction: '' };
    const next = invoiceReducer(initial, { type: 'RESET_INVOICE' });
    expect(next.invoiceNumber).toBe('');
    expect(next._lastAction).toBe('RESET_INVOICE');
  });

  it('SET_INVOICE_NUMBER updates invoiceNumber and stamps _lastAction', () => {
    const state = createDefaultState();
    const next = invoiceReducer(state, { type: 'SET_INVOICE_NUMBER', payload: 'INV-001' });
    expect(next.invoiceNumber).toBe('INV-001');
    expect(next._lastAction).toBe('SET_INVOICE_NUMBER');
  });

  it('ADD_LINE_ITEM appends a new blank line item', () => {
    const state = createDefaultState();
    const next = invoiceReducer(state, { type: 'ADD_LINE_ITEM' });
    expect(next.lineItems).toHaveLength(2);
  });

  it('REMOVE_LINE_ITEM removes the item with the given id', () => {
    const state = createDefaultState();
    const id = state.lineItems[0].id;
    // Add a second item first so we can remove the first.
    const withTwo = invoiceReducer(state, { type: 'ADD_LINE_ITEM' });
    const next = invoiceReducer(withTwo, { type: 'REMOVE_LINE_ITEM', payload: id });
    expect(next.lineItems).toHaveLength(1);
    expect(next.lineItems[0].id).not.toBe(id);
  });
});

// ---------------------------------------------------------------------------
// Provider integration tests
// ---------------------------------------------------------------------------

function TestConsumer() {
  const { state, dispatch } = useInvoice();
  return (
    <div>
      <span data-testid="invoice-number">{state.invoiceNumber}</span>
      <button onClick={() => dispatch({ type: 'SET_INVOICE_NUMBER', payload: 'INV-042' })}>
        Set Number
      </button>
      <button onClick={() => dispatch({ type: 'RESET_INVOICE' })}>Reset</button>
    </div>
  );
}

describe('InvoiceProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads initial state from localStorage when key is present', () => {
    const saved: InvoiceState = { ...createDefaultState(), invoiceNumber: 'INV-SAVED', _lastAction: '' };
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(saved));
    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);
    expect(screen.getByTestId('invoice-number').textContent).toBe('INV-SAVED');
  });

  it('falls back to default state when localStorage key is absent', () => {
    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);
    expect(screen.getByTestId('invoice-number').textContent).toBe('');
  });

  it('falls back to default state when localStorage contains invalid JSON', () => {
    localStorage.setItem(INVOICE_STORAGE_KEY, 'not-json{{{');
    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);
    expect(screen.getByTestId('invoice-number').textContent).toBe('');
  });

  it('persists state to localStorage on normal dispatch', async () => {
    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);
    await act(async () => {
      screen.getByText('Set Number').click();
    });
    const stored = localStorage.getItem(INVOICE_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!) as InvoiceState;
    expect(parsed.invoiceNumber).toBe('INV-042');
  });

  it('does NOT write to localStorage after RESET_INVOICE', async () => {
    // Pre-populate so there is something to clear.
    const saved: InvoiceState = { ...createDefaultState(), invoiceNumber: 'INV-PRE', _lastAction: '' };
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(saved));

    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);

    // Remove the key as Header would, then dispatch reset.
    localStorage.removeItem(INVOICE_STORAGE_KEY);
    await act(async () => {
      screen.getByText('Reset').click();
    });

    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).toBeNull();
  });

  it('resets invoice number to empty string after RESET_INVOICE', async () => {
    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);
    await act(async () => {
      screen.getByText('Set Number').click();
    });
    expect(screen.getByTestId('invoice-number').textContent).toBe('INV-042');

    localStorage.removeItem(INVOICE_STORAGE_KEY);
    await act(async () => {
      screen.getByText('Reset').click();
    });
    expect(screen.getByTestId('invoice-number').textContent).toBe('');
  });
});
