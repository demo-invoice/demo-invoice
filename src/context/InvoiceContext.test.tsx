/**
 * Tests for InvoiceContext reducer — verifies all typed action literals
 * produce the correct state transitions.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { InvoiceProvider, useInvoice } from './InvoiceContext';

// Helper component that exposes dispatch for testing
function TestConsumer({ onRender }: { onRender: (ctx: ReturnType<typeof useInvoice>) => void }) {
  const ctx = useInvoice();
  onRender(ctx);
  return <div data-testid="state">{JSON.stringify(ctx.state)}</div>;
}

describe('InvoiceContext reducer', () => {
  it('UPDATE_INVOICE_FIELD updates the correct field', () => {
    let ctx!: ReturnType<typeof useInvoice>;
    render(
      <InvoiceProvider>
        <TestConsumer onRender={(c) => { ctx = c; }} />
      </InvoiceProvider>
    );
    act(() => ctx.dispatch({ type: 'UPDATE_INVOICE_FIELD', field: 'invoiceNumber', value: 'INV-001' }));
    expect(JSON.parse(screen.getByTestId('state').textContent!).invoiceNumber).toBe('INV-001');
  });

  it('ADD_LINE_ITEM appends a new item', () => {
    let ctx!: ReturnType<typeof useInvoice>;
    render(
      <InvoiceProvider>
        <TestConsumer onRender={(c) => { ctx = c; }} />
      </InvoiceProvider>
    );
    act(() => ctx.dispatch({ type: 'ADD_LINE_ITEM' }));
    const state = JSON.parse(screen.getByTestId('state').textContent!);
    expect(state.lineItems).toHaveLength(1);
  });

  it('REMOVE_LINE_ITEM removes the correct item', () => {
    let ctx!: ReturnType<typeof useInvoice>;
    render(
      <InvoiceProvider>
        <TestConsumer onRender={(c) => { ctx = c; }} />
      </InvoiceProvider>
    );
    act(() => ctx.dispatch({ type: 'ADD_LINE_ITEM' }));
    act(() => ctx.dispatch({ type: 'ADD_LINE_ITEM' }));
    const stateAfterAdd = JSON.parse(screen.getByTestId('state').textContent!);
    const firstId = stateAfterAdd.lineItems[0].id;
    act(() => ctx.dispatch({ type: 'REMOVE_LINE_ITEM', id: firstId }));
    const stateAfterRemove = JSON.parse(screen.getByTestId('state').textContent!);
    expect(stateAfterRemove.lineItems).toHaveLength(1);
    expect(stateAfterRemove.lineItems[0].id).not.toBe(firstId);
  });

  it('UPDATE_LINE_ITEM updates the correct field on the correct item', () => {
    let ctx!: ReturnType<typeof useInvoice>;
    render(
      <InvoiceProvider>
        <TestConsumer onRender={(c) => { ctx = c; }} />
      </InvoiceProvider>
    );
    act(() => ctx.dispatch({ type: 'ADD_LINE_ITEM' }));
    const state = JSON.parse(screen.getByTestId('state').textContent!);
    const id = state.lineItems[0].id;
    act(() => ctx.dispatch({ type: 'UPDATE_LINE_ITEM', id, field: 'description', value: 'Widget' }));
    const updated = JSON.parse(screen.getByTestId('state').textContent!);
    expect(updated.lineItems[0].description).toBe('Widget');
  });

  it('SET_CURRENCY updates the currency', () => {
    let ctx!: ReturnType<typeof useInvoice>;
    render(
      <InvoiceProvider>
        <TestConsumer onRender={(c) => { ctx = c; }} />
      </InvoiceProvider>
    );
    act(() => ctx.dispatch({ type: 'SET_CURRENCY', currency: 'EUR' }));
    const state = JSON.parse(screen.getByTestId('state').textContent!);
    expect(state.currency).toBe('EUR');
  });

  it('throws when useInvoice is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer onRender={() => {}} />)).toThrow(
      'useInvoice must be used within an InvoiceProvider'
    );
    spy.mockRestore();
  });
});
