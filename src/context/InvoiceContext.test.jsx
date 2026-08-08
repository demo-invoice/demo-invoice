import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InvoiceProvider, useInvoice, UPDATE_INVOICE_STATUS } from './InvoiceContext.jsx';

describe('InvoiceContext', () => {
  it('provides default state values', () => {
    const wrapper = ({ children }) => <InvoiceProvider>{children}</InvoiceProvider>;
    const { result } = renderHook(() => useInvoice(), { wrapper });
    expect(result.current.invoiceNumber).toBeDefined();
    expect(result.current.lineItems).toBeDefined();
    expect(result.current.dispatch).toBeTypeOf('function');
  });

  it('UPDATE_INVOICE_STATUS updates the status field', () => {
    const wrapper = ({ children }) => <InvoiceProvider>{children}</InvoiceProvider>;
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: UPDATE_INVOICE_STATUS, value: 'Sent' });
    });
    expect(result.current.status).toBe('Sent');
  });

  it('unknown action returns the same state reference', () => {
    const wrapper = ({ children }) => <InvoiceProvider>{children}</InvoiceProvider>;
    const { result } = renderHook(() => useInvoice(), { wrapper });
    const before = result.current;
    act(() => {
      result.current.dispatch({ type: '__UNKNOWN__' });
    });
    // state reference should be identical (return state, not spread)
    expect(result.current).toBe(before);
  });

  it('REMOVE_LOGO sets logoUrl to null', () => {
    const wrapper = ({ children }) => (
      <InvoiceProvider initialState={{ logoUrl: 'data:image/png;base64,xyz' }}>
        {children}
      </InvoiceProvider>
    );
    const { result } = renderHook(() => useInvoice(), { wrapper });
    // Before removal, logoUrl should be the seeded value
    expect(result.current.logoUrl).toBe('data:image/png;base64,xyz');
    act(() => {
      result.current.dispatch({ type: 'REMOVE_LOGO' });
    });
    expect(result.current.logoUrl).toBe(null);
  });

  it('SET_LOGO sets logoUrl to the provided data URL', () => {
    const wrapper = ({ children }) => <InvoiceProvider>{children}</InvoiceProvider>;
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_LOGO', payload: 'data:image/png;base64,abc' });
    });
    expect(result.current.logoUrl).toBe('data:image/png;base64,abc');
  });

  it('SET_LOGO then REMOVE_LOGO leaves logoUrl as null', () => {
    const wrapper = ({ children }) => <InvoiceProvider>{children}</InvoiceProvider>;
    const { result } = renderHook(() => useInvoice(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_LOGO', payload: 'data:image/png;base64,xyz' });
    });
    act(() => {
      result.current.dispatch({ type: 'REMOVE_LOGO' });
    });
    expect(result.current.logoUrl).toBe(null);
  });
});
