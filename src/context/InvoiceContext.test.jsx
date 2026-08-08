import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  InvoiceProvider,
  useInvoice,
  UPDATE_INVOICE_STATUS,
  UPDATE_FIELD,
} from './InvoiceContext.jsx';

// ---------------------------------------------------------------------------
// Consumer component — renders every field exposed by useInvoice()
// ---------------------------------------------------------------------------
function Consumer() {
  const {
    invoiceNumber, clientName, clientEmail, lineItems,
    subtotal, tax, total, invoiceDate, dueDate, status,
    logoDataUrl, dispatch,
  } = useInvoice();

  return (
    <div>
      <span data-testid="invoiceNumber">{invoiceNumber}</span>
      <span data-testid="clientName">{clientName}</span>
      <span data-testid="clientEmail">{clientEmail}</span>
      <span data-testid="lineItems">{JSON.stringify(lineItems)}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <span data-testid="tax">{tax}</span>
      <span data-testid="total">{total}</span>
      <span data-testid="invoiceDate">{invoiceDate}</span>
      <span data-testid="dueDate">{dueDate}</span>
      <span data-testid="status">{status}</span>
      <span data-testid="logo-url">{logoDataUrl ?? 'null'}</span>

      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'clientName', value: 'Acme' })}>Set Client Name</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'invoiceNumber', value: 'INV-042' })}>Set Invoice Number</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'clientEmail', value: 'a@b.com' })}>Set Client Email</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'subtotal', value: 200 })}>Set Subtotal</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'tax', value: 20 })}>Set Tax</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'total', value: 220 })}>Set Total</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'invoiceDate', value: '2024-03-01' })}>Set Invoice Date</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'dueDate', value: '2024-03-31' })}>Set Due Date</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'lineItems', value: [{ description: 'A', quantity: 1, unitPrice: 10 }] })}>Set Line Items</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'lineItems', value: 'not-an-array' })}>Set Bad Line Items</button>
      <button onClick={() => dispatch({ type: UPDATE_INVOICE_STATUS, value: 'Sent' })}>Mark Sent</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'logoDataUrl', value: 'data:image/png;base64,abc' })}>Set Logo</button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'logoDataUrl', value: null })}>Remove Logo</button>
      <button onClick={() => dispatch({ type: '__UNKNOWN__' })}>Unknown Action</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <InvoiceProvider>
      <Consumer />
    </InvoiceProvider>
  );
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
describe('InvoiceContext — initial state', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('exposes all fields with correct defaults', () => {
    renderWithProvider();
    expect(screen.getByTestId('invoiceNumber')).toHaveTextContent('');
    expect(screen.getByTestId('clientName')).toHaveTextContent('');
    expect(screen.getByTestId('clientEmail')).toHaveTextContent('');
    expect(screen.getByTestId('lineItems')).toHaveTextContent('[]');
    expect(screen.getByTestId('subtotal')).toHaveTextContent('0');
    expect(screen.getByTestId('tax')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('invoiceDate')).toHaveTextContent('');
    expect(screen.getByTestId('dueDate')).toHaveTextContent('');
    expect(screen.getByTestId('status')).toHaveTextContent('');
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });

  it('rehydrates logoDataUrl from localStorage when value starts with data:image/', () => {
    localStorage.setItem('invoice_logo', 'data:image/png;base64,xyz');
    renderWithProvider();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('data:image/png;base64,xyz');
  });

  it('ignores a localStorage value that does not start with data:image/', () => {
    localStorage.setItem('invoice_logo', 'not-a-data-url');
    renderWithProvider();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });

  it('degrades gracefully when localStorage.getItem throws on mount', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('SecurityError'); });
    renderWithProvider();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });
});

// ---------------------------------------------------------------------------
// Reducer — UPDATE_FIELD
// ---------------------------------------------------------------------------
describe('InvoiceContext — UPDATE_FIELD', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('updates clientName', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Client Name').click(); });
    expect(screen.getByTestId('clientName')).toHaveTextContent('Acme');
  });

  it('updates invoiceNumber', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Invoice Number').click(); });
    expect(screen.getByTestId('invoiceNumber')).toHaveTextContent('INV-042');
  });

  it('updates clientEmail', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Client Email').click(); });
    expect(screen.getByTestId('clientEmail')).toHaveTextContent('a@b.com');
  });

  it('updates subtotal as a number', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Subtotal').click(); });
    expect(screen.getByTestId('subtotal')).toHaveTextContent('200');
  });

  it('updates tax as a number', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Tax').click(); });
    expect(screen.getByTestId('tax')).toHaveTextContent('20');
  });

  it('updates total as a number', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Total').click(); });
    expect(screen.getByTestId('total')).toHaveTextContent('220');
  });

  it('updates invoiceDate', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Invoice Date').click(); });
    expect(screen.getByTestId('invoiceDate')).toHaveTextContent('2024-03-01');
  });

  it('updates dueDate', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Due Date').click(); });
    expect(screen.getByTestId('dueDate')).toHaveTextContent('2024-03-31');
  });

  it('updates lineItems when value is an array', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Line Items').click(); });
    expect(screen.getByTestId('lineItems')).toHaveTextContent('"description":"A"');
  });

  it('ignores UPDATE_FIELD for lineItems when value is not an array', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Bad Line Items').click(); });
    // lineItems must remain []
    expect(screen.getByTestId('lineItems')).toHaveTextContent('[]');
  });

  it('persists logoDataUrl to localStorage', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Logo').click(); });
    expect(localStorage.getItem('invoice_logo')).toBe('data:image/png;base64,abc');
    expect(screen.getByTestId('logo-url')).toHaveTextContent('data:image/png;base64,abc');
  });

  it('removes logoDataUrl from localStorage when set to null', () => {
    localStorage.setItem('invoice_logo', 'data:image/png;base64,abc');
    renderWithProvider();
    act(() => { screen.getByText('Remove Logo').click(); });
    expect(localStorage.getItem('invoice_logo')).toBeNull();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });

  it('degrades gracefully when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    renderWithProvider();
    act(() => { screen.getByText('Set Logo').click(); });
    // In-memory state still updated
    expect(screen.getByTestId('logo-url')).toHaveTextContent('data:image/png;base64,abc');
  });
});

// ---------------------------------------------------------------------------
// Reducer — UPDATE_INVOICE_STATUS
// ---------------------------------------------------------------------------
describe('InvoiceContext — UPDATE_INVOICE_STATUS', () => {
  beforeEach(() => { localStorage.clear(); });

  it('updates status to Sent', () => {
    renderWithProvider();
    act(() => { screen.getByText('Mark Sent').click(); });
    expect(screen.getByTestId('status')).toHaveTextContent('Sent');
  });

  it('UPDATE_INVOICE_STATUS is exported as a string constant', () => {
    expect(typeof UPDATE_INVOICE_STATUS).toBe('string');
    expect(UPDATE_INVOICE_STATUS).toBe('UPDATE_INVOICE_STATUS');
  });
});

// ---------------------------------------------------------------------------
// Reducer — unknown action returns same state reference
// ---------------------------------------------------------------------------
describe('InvoiceContext — unknown action', () => {
  beforeEach(() => { localStorage.clear(); });

  it('unknown action does not change any visible state', () => {
    renderWithProvider();
    const before = screen.getByTestId('clientName').textContent;
    act(() => { screen.getByText('Unknown Action').click(); });
    expect(screen.getByTestId('clientName').textContent).toBe(before);
    expect(screen.getByTestId('lineItems')).toHaveTextContent('[]');
    expect(screen.getByTestId('status')).toHaveTextContent('');
  });
});
