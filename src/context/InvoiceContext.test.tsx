import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvoiceProvider, useInvoiceState, useInvoiceDispatch } from './InvoiceContext';

/** Test harness that reads a single field from state. */
function ReadField({ field }: { field: 'invoiceNumber' | 'notes' | 'taxRate' }): React.JSX.Element {
  const state = useInvoiceState();
  return <span data-testid="value">{state[field]}</span>;
}

/** Test harness that dispatches UPDATE_FIELD. */
function WriteField(): React.JSX.Element {
  const dispatch = useInvoiceDispatch();
  return (
    <button onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-999' })}>
      set
    </button>
  );
}

describe('InvoiceContext', () => {
  it('provides initial empty invoiceNumber', () => {
    render(
      <InvoiceProvider>
        <ReadField field="invoiceNumber" />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('value').textContent).toBe('');
  });

  it('UPDATE_FIELD updates state and re-renders consumers', () => {
    render(
      <InvoiceProvider>
        <WriteField />
        <ReadField field="invoiceNumber" />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByText('set'));
    expect(screen.getByTestId('value').textContent).toBe('INV-999');
  });

  it('throws when useInvoiceState is used outside provider', () => {
    // Suppress React error boundary noise in test output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<ReadField field="invoiceNumber" />)).toThrow(
      'useInvoiceState must be used within an InvoiceProvider'
    );
    spy.mockRestore();
  });

  it('ADD_LINE_ITEM appends a new item', () => {
    function AddAndCount(): React.JSX.Element {
      const state = useInvoiceState();
      const dispatch = useInvoiceDispatch();
      return (
        <>
          <button onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}>add</button>
          <span data-testid="count">{state.lineItems.length}</span>
        </>
      );
    }
    render(
      <InvoiceProvider>
        <AddAndCount />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });
});
