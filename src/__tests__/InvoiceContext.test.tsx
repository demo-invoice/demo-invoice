import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { InvoiceProvider, useInvoice, DEFAULT_INVOICE_STATE } from '../context/InvoiceContext';
import type { InvoiceState, InvoiceAction } from '../types/invoice';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <InvoiceProvider>{children}</InvoiceProvider>
);

const loadedState: InvoiceState = {
  invoiceNumber: 'INV-999',
  issueDate: '2024-06-01',
  dueDate: '2024-07-01',
  from: 'Loaded From',
  to: 'Loaded To',
  lineItems: [{ id: 'li-1', description: 'Widget', quantity: 2, unitPrice: 50 }],
};

beforeEach(() => {
  localStorage.clear();
});

describe('InvoiceContext reducer', () => {
  it('LOAD_SAVED_INVOICE replaces entire state with payload', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'LOAD_SAVED_INVOICE', payload: loadedState });
    });

    expect(result.current.state).toEqual(loadedState);
  });

  it('NEW_INVOICE resets state to default', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'LOAD_SAVED_INVOICE', payload: loadedState });
    });
    act(() => {
      result.current.dispatch({ type: 'NEW_INVOICE' });
    });

    expect(result.current.state).toEqual(DEFAULT_INVOICE_STATE);
  });

  it('SET_INVOICE_NUMBER updates invoiceNumber', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_INVOICE_NUMBER', payload: 'INV-042' });
    });
    expect(result.current.state.invoiceNumber).toBe('INV-042');
  });

  it('SET_ISSUE_DATE updates issueDate', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ISSUE_DATE', payload: '2024-03-01' });
    });
    expect(result.current.state.issueDate).toBe('2024-03-01');
  });

  it('SET_DUE_DATE updates dueDate', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_DUE_DATE', payload: '2024-04-01' });
    });
    expect(result.current.state.dueDate).toBe('2024-04-01');
  });

  it('SET_FROM updates from', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_FROM', payload: 'New Sender' });
    });
    expect(result.current.state.from).toBe('New Sender');
  });

  it('SET_TO updates to', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_TO', payload: 'New Recipient' });
    });
    expect(result.current.state.to).toBe('New Recipient');
  });

  it('LOAD_SAVED_INVOICE is a valid member of InvoiceAction union (type-level test)', () => {
    // This test verifies at compile time that LOAD_SAVED_INVOICE is in the union.
    // If the type is removed, TypeScript will error here.
    const action: InvoiceAction = { type: 'LOAD_SAVED_INVOICE', payload: loadedState };
    expect(action.type).toBe('LOAD_SAVED_INVOICE');
  });
});
