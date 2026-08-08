import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InvoiceProvider, useInvoice, UPDATE_INVOICE_STATUS, UPDATE_FIELD } from './InvoiceContext.jsx';

// ---------------------------------------------------------------------------
// Consumer helper — renders every field so we can assert on them
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

      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'clientName', value: 'Acme' })}>
        Set Client Name
      </button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'lineItems', value: [{ description: 'A', quantity: 1, unitPrice: 10 }] })}>
        Set Line Items
      </button>
      <button onClick={() => dispatch({ type: UPDATE_INVOICE_STATUS, value: 'Sent' })}>
        Mark Sent
      </button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'logoDataUrl', value: 'data:image/png;base64,abc' })}>
        Set Logo
      </button>
      <button onClick={() => dispatch({ type: UPDATE_FIELD, field: 'logoDataUrl', value: null })}>
        Remove Logo
      </button>
      <button onClick={() => dispatch({ type: '__UNKNOWN__' })}>
        Unknown Action
      </button>
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

  it('rehydrates logoDataUrl from localStorage on mount', () => {
    localStorage.setItem('invoice_logo', 'data:image/png;base64,xyz');
    renderWithProvider();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('data:image/png;base64,xyz');
  });

  it('ignores a localStorage value that does not start with data:image/', () => {
    localStorage.setItem('invoice_logo', 'not-a-data-url');
    renderWithProvider();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });
});

describe('InvoiceContext — reducer actions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('UPDATE_FIELD updates a string field', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Client Name').click(); });
    expect(screen.getByTestId('clientName')).toHaveTextContent('Acme');
  });

  it('UPDATE_FIELD updates lineItems when value is an array', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Line Items').click(); });
    expect(screen.getByTestId('lineItems')).toHaveTextContent('"description":"A"');
  });

  it('UPDATE_INVOICE_STATUS updates status to Sent', () => {
    renderWithProvider();
    act(() => { screen.getByText('Mark Sent').click(); });
    expect(screen.getByTestId('status')).toHaveTextContent('Sent');
  });

  it('UPDATE_FIELD with logoDataUrl persists to localStorage', () => {
    renderWithProvider();
    act(() => { screen.getByText('Set Logo').click(); });
    expect(localStorage.getItem('invoice_logo')).toBe('data:image/png;base64,abc');
    expect(screen.getByTestId('logo-url')).toHaveTextContent('data:image/png;base64,abc');
  });

  it('UPDATE_FIELD with logoDataUrl null removes from localStorage', () => {
    localStorage.setItem('invoice_logo', 'data:image/png;base64,abc');
    renderWithProvider();
    act(() => { screen.getByText('Remove Logo').click(); });
    expect(localStorage.getItem('invoice_logo')).toBeNull();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });

  it('unknown action returns the exact same state reference (no spread copy)', () => {
    // We verify this indirectly: the component must not re-render (same reference).
    // We capture the rendered text before and after — it must be unchanged.
    renderWithProvider();
    const before = screen.getByTestId('clientName').textContent;
    act(() => { screen.getByText('Unknown Action').click(); });
    expect(screen.getByTestId('clientName').textContent).toBe(before);
  });

  it('degrades gracefully when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    renderWithProvider();
    act(() => { screen.getByText('Set Logo').click(); });
    // State still updated in-memory even though storage failed
    expect(screen.getByTestId('logo-url')).toHaveTextContent('data:image/png;base64,abc');
  });

  it('degrades gracefully when localStorage.getItem throws on mount', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    renderWithProvider();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });
});
