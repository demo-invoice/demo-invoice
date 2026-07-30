import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InvoiceProvider, useInvoiceState, useInvoiceDispatch } from './InvoiceContext';

// ---------------------------------------------------------------------------
// Test harness components
// ---------------------------------------------------------------------------

function ReadField({ field }: { field: keyof ReturnType<typeof useInvoiceState> }): React.JSX.Element {
  const state = useInvoiceState();
  const value = state[field];
  return <span data-testid="value">{typeof value === 'string' ? value : JSON.stringify(value)}</span>;
}

function WriteField({
  field,
  value,
}: {
  field: keyof Omit<ReturnType<typeof useInvoiceState>, 'lineItems'>;
  value: string;
}): React.JSX.Element {
  const dispatch = useInvoiceDispatch();
  return (
    <button onClick={() => dispatch({ type: 'UPDATE_FIELD', field, value })}>
      set
    </button>
  );
}

function LineItemManager(): React.JSX.Element {
  const state = useInvoiceState();
  const dispatch = useInvoiceDispatch();
  return (
    <>
      <button data-testid="add" onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}>add</button>
      <span data-testid="count">{state.lineItems.length}</span>
      {state.lineItems.map((item) => (
        <div key={item.id}>
          <span data-testid={`item-desc-${item.id}`}>{item.description}</span>
          <span data-testid={`item-qty-${item.id}`}>{item.quantity}</span>
          <span data-testid={`item-price-${item.id}`}>{item.unitPrice}</span>
          <button
            data-testid={`remove-${item.id}`}
            onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', id: item.id })}
          >
            remove
          </button>
          <button
            data-testid={`update-${item.id}`}
            onClick={() =>
              dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field: 'description', value: 'Updated Desc' })
            }
          >
            update
          </button>
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('InvoiceContext — initial state', () => {
  it('provides empty string for invoiceNumber', () => {
    render(
      <InvoiceProvider>
        <ReadField field="invoiceNumber" />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('value').textContent).toBe('');
  });

  it('provides empty string for notes', () => {
    render(
      <InvoiceProvider>
        <ReadField field="notes" />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('value').textContent).toBe('');
  });

  it('provides "0" for taxRate', () => {
    render(
      <InvoiceProvider>
        <ReadField field="taxRate" />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('value').textContent).toBe('0');
  });

  it('provides empty array for lineItems', () => {
    render(
      <InvoiceProvider>
        <ReadField field="lineItems" />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('value').textContent).toBe('[]');
  });

  it('provides empty string for senderName', () => {
    render(
      <InvoiceProvider>
        <ReadField field="senderName" />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('value').textContent).toBe('');
  });
});

// ---------------------------------------------------------------------------
// UPDATE_FIELD action
// ---------------------------------------------------------------------------

describe('InvoiceContext — UPDATE_FIELD', () => {
  it('updates invoiceNumber and re-renders consumers', () => {
    render(
      <InvoiceProvider>
        <WriteField field="invoiceNumber" value="INV-999" />
        <ReadField field="invoiceNumber" />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByText('set'));
    expect(screen.getByTestId('value').textContent).toBe('INV-999');
  });

  it('updates notes field', () => {
    render(
      <InvoiceProvider>
        <WriteField field="notes" value="Net 30" />
        <ReadField field="notes" />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByText('set'));
    expect(screen.getByTestId('value').textContent).toBe('Net 30');
  });

  it('updates taxRate field', () => {
    render(
      <InvoiceProvider>
        <WriteField field="taxRate" value="15" />
        <ReadField field="taxRate" />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByText('set'));
    expect(screen.getByTestId('value').textContent).toBe('15');
  });

  it('updates senderName field', () => {
    render(
      <InvoiceProvider>
        <WriteField field="senderName" value="Acme Corp" />
        <ReadField field="senderName" />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByText('set'));
    expect(screen.getByTestId('value').textContent).toBe('Acme Corp');
  });

  it('updates billToName field', () => {
    render(
      <InvoiceProvider>
        <WriteField field="billToName" value="Jane Doe" />
        <ReadField field="billToName" />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByText('set'));
    expect(screen.getByTestId('value').textContent).toBe('Jane Doe');
  });
});

// ---------------------------------------------------------------------------
// ADD_LINE_ITEM action
// ---------------------------------------------------------------------------

describe('InvoiceContext — ADD_LINE_ITEM', () => {
  it('starts with 0 line items', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('appends one item on first ADD_LINE_ITEM', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('appends multiple items on repeated ADD_LINE_ITEM', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    fireEvent.click(screen.getByTestId('add'));
    fireEvent.click(screen.getByTestId('add'));
    expect(screen.getByTestId('count').textContent).toBe('3');
  });

  it('new item has default quantity of "1"', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    const qtyEls = screen.getAllByTestId(/^item-qty-/);
    expect(qtyEls[0].textContent).toBe('1');
  });

  it('new item has default unitPrice of "0"', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    const priceEls = screen.getAllByTestId(/^item-price-/);
    expect(priceEls[0].textContent).toBe('0');
  });

  it('new item has empty description', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    const descEls = screen.getAllByTestId(/^item-desc-/);
    expect(descEls[0].textContent).toBe('');
  });
});

// ---------------------------------------------------------------------------
// REMOVE_LINE_ITEM action
// ---------------------------------------------------------------------------

describe('InvoiceContext — REMOVE_LINE_ITEM', () => {
  it('removes the item with the matching id', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    const removeBtn = screen.getAllByText('remove')[0];
    fireEvent.click(removeBtn);
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('removes only the targeted item when multiple exist', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    fireEvent.click(screen.getByTestId('add'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    const removeBtns = screen.getAllByText('remove');
    fireEvent.click(removeBtns[0]);
    expect(screen.getByTestId('count').textContent).toBe('1');
  });
});

// ---------------------------------------------------------------------------
// UPDATE_LINE_ITEM action
// ---------------------------------------------------------------------------

describe('InvoiceContext — UPDATE_LINE_ITEM', () => {
  it('updates the description of the targeted item', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    const updateBtn = screen.getAllByText('update')[0];
    fireEvent.click(updateBtn);
    const descEls = screen.getAllByTestId(/^item-desc-/);
    expect(descEls[0].textContent).toBe('Updated Desc');
  });

  it('does not mutate other items when updating one', () => {
    render(
      <InvoiceProvider>
        <LineItemManager />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    fireEvent.click(screen.getByTestId('add'));
    const updateBtns = screen.getAllByText('update');
    fireEvent.click(updateBtns[0]);
    const descEls = screen.getAllByTestId(/^item-desc-/);
    // First item updated
    expect(descEls[0].textContent).toBe('Updated Desc');
    // Second item unchanged
    expect(descEls[1].textContent).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Error boundary — hooks used outside provider
// ---------------------------------------------------------------------------

describe('InvoiceContext — provider guard', () => {
  it('throws when useInvoiceState is used outside InvoiceProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() =>
      render(<ReadField field="invoiceNumber" />)
    ).toThrow('useInvoiceState must be used within an InvoiceProvider');
    spy.mockRestore();
  });

  it('throws when useInvoiceDispatch is used outside InvoiceProvider', () => {
    function BadDispatch(): React.JSX.Element {
      useInvoiceDispatch();
      return <span />;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<BadDispatch />)).toThrow(
      'useInvoiceDispatch must be used within an InvoiceProvider'
    );
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Immutability — reducer returns new references
// ---------------------------------------------------------------------------

describe('InvoiceContext — reducer immutability', () => {
  it('UPDATE_FIELD does not mutate other fields', () => {
    let capturedState: ReturnType<typeof useInvoiceState> | null = null;

    function Capture(): React.JSX.Element {
      capturedState = useInvoiceState();
      return null;
    }

    render(
      <InvoiceProvider>
        <WriteField field="invoiceNumber" value="X" />
        <Capture />
      </InvoiceProvider>
    );

    const before = capturedState!.notes;
    fireEvent.click(screen.getByText('set'));
    // notes should remain unchanged (still empty string)
    expect(capturedState!.notes).toBe(before);
    expect(capturedState!.notes).toBe('');
  });
});
