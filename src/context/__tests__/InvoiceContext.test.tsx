import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { InvoiceProvider, useInvoice, invoiceReducer } from '../InvoiceContext';
import { INVOICE_STORAGE_KEY, createDefaultState } from '../../constants/invoice';
import type { InvoiceState } from '../../types/invoice';

// ---------------------------------------------------------------------------
// Reducer unit tests
// ---------------------------------------------------------------------------

describe('invoiceReducer', () => {
  it('RESET_INVOICE returns fresh default state with _lastAction = RESET_INVOICE', () => {
    const initial: InvoiceState = { ...createDefaultState(), invoiceNumber: 'INV-999', _lastAction: '' };
    const next = invoiceReducer(initial, { type: 'RESET_INVOICE' });
    expect(next.invoiceNumber).toBe('');
    expect(next.fromName).toBe('');
    expect(next.toName).toBe('');
    expect(next.notes).toBe('');
    expect(next._lastAction).toBe('RESET_INVOICE');
  });

  it('RESET_INVOICE sets issueDate to today (not a stale module-load date)', () => {
    const today = new Date().toISOString().slice(0, 10);
    const state = createDefaultState();
    const next = invoiceReducer(state, { type: 'RESET_INVOICE' });
    expect(next.issueDate).toBe(today);
  });

  it('SET_INVOICE_NUMBER updates invoiceNumber and stamps _lastAction', () => {
    const state = createDefaultState();
    const next = invoiceReducer(state, { type: 'SET_INVOICE_NUMBER', payload: 'INV-001' });
    expect(next.invoiceNumber).toBe('INV-001');
    expect(next._lastAction).toBe('SET_INVOICE_NUMBER');
  });

  it('SET_ISSUE_DATE updates issueDate', () => {
    const state = createDefaultState();
    const next = invoiceReducer(state, { type: 'SET_ISSUE_DATE', payload: '2024-06-01' });
    expect(next.issueDate).toBe('2024-06-01');
    expect(next._lastAction).toBe('SET_ISSUE_DATE');
  });

  it('SET_FROM_NAME updates fromName', () => {
    const state = createDefaultState();
    const next = invoiceReducer(state, { type: 'SET_FROM_NAME', payload: 'Acme Corp' });
    expect(next.fromName).toBe('Acme Corp');
  });

  it('SET_NOTES updates notes', () => {
    const state = createDefaultState();
    const next = invoiceReducer(state, { type: 'SET_NOTES', payload: 'Net 30' });
    expect(next.notes).toBe('Net 30');
  });

  it('ADD_LINE_ITEM appends a new blank line item', () => {
    const state = createDefaultState();
    const next = invoiceReducer(state, { type: 'ADD_LINE_ITEM' });
    expect(next.lineItems).toHaveLength(2);
    expect(next.lineItems[1].description).toBe('');
    expect(next.lineItems[1].quantity).toBe(1);
    expect(next.lineItems[1].unitPrice).toBe(0);
    expect(next._lastAction).toBe('ADD_LINE_ITEM');
  });

  it('REMOVE_LINE_ITEM removes the item with the given id', () => {
    const state = createDefaultState();
    const withTwo = invoiceReducer(state, { type: 'ADD_LINE_ITEM' });
    const idToRemove = withTwo.lineItems[0].id;
    const next = invoiceReducer(withTwo, { type: 'REMOVE_LINE_ITEM', payload: idToRemove });
    expect(next.lineItems).toHaveLength(1);
    expect(next.lineItems.find((li) => li.id === idToRemove)).toBeUndefined();
    expect(next._lastAction).toBe('REMOVE_LINE_ITEM');
  });

  it('UPDATE_LINE_ITEM replaces the matching line item', () => {
    const state = createDefaultState();
    const id = state.lineItems[0].id;
    const updated = { id, description: 'Widget', quantity: 3, unitPrice: 9.99 };
    const next = invoiceReducer(state, { type: 'UPDATE_LINE_ITEM', payload: updated });
    expect(next.lineItems[0]).toEqual(updated);
    expect(next._lastAction).toBe('UPDATE_LINE_ITEM');
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
      <span data-testid="from-name">{state.fromName}</span>
      <button onClick={() => dispatch({ type: 'SET_INVOICE_NUMBER', payload: 'INV-042' })}>
        Set Number
      </button>
      <button onClick={() => dispatch({ type: 'SET_FROM_NAME', payload: 'Filled Name' })}>
        Set Name
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

  it('persists state to localStorage on a normal dispatch', async () => {
    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);
    await act(async () => {
      screen.getByText('Set Number').click();
    });
    const stored = localStorage.getItem(INVOICE_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!) as InvoiceState;
    expect(parsed.invoiceNumber).toBe('INV-042');
  });

  it('does NOT write to localStorage after RESET_INVOICE (key stays absent)', async () => {
    const saved: InvoiceState = { ...createDefaultState(), invoiceNumber: 'INV-PRE', _lastAction: '' };
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(saved));

    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);

    // Simulate Header removing the key before dispatching.
    localStorage.removeItem(INVOICE_STORAGE_KEY);
    await act(async () => {
      screen.getByText('Reset').click();
    });

    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).toBeNull();
  });

  it('resets displayed invoiceNumber to empty string after RESET_INVOICE', async () => {
    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);
    await act(async () => { screen.getByText('Set Number').click(); });
    expect(screen.getByTestId('invoice-number').textContent).toBe('INV-042');

    localStorage.removeItem(INVOICE_STORAGE_KEY);
    await act(async () => { screen.getByText('Reset').click(); });
    expect(screen.getByTestId('invoice-number').textContent).toBe('');
  });

  it('resets fromName to empty string after RESET_INVOICE', async () => {
    render(<InvoiceProvider><TestConsumer /></InvoiceProvider>);
    await act(async () => { screen.getByText('Set Name').click(); });
    expect(screen.getByTestId('from-name').textContent).toBe('Filled Name');

    localStorage.removeItem(INVOICE_STORAGE_KEY);
    await act(async () => { screen.getByText('Reset').click(); });
    expect(screen.getByTestId('from-name').textContent).toBe('');
  });

  it('throws when useInvoice is used outside InvoiceProvider', () => {
    function Orphan() {
      useInvoice();
      return null;
    }
    // Suppress React's error boundary console output.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow('useInvoice must be used within an InvoiceProvider');
    consoleError.mockRestore();
  });
});
