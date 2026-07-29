import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InvoiceProvider, useInvoice } from './InvoiceContext.jsx';

function Consumer() {
  const { logoDataUrl, setLogoDataUrl, removeLogo } = useInvoice();
  return (
    <div>
      <span data-testid="logo-url">{logoDataUrl ?? 'null'}</span>
      <button onClick={() => setLogoDataUrl('data:image/png;base64,abc')}>Set Logo</button>
      <button onClick={removeLogo}>Remove Logo</button>
    </div>
  );
}

describe('InvoiceContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initialises with null when localStorage is empty', () => {
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });

  it('rehydrates logoDataUrl from localStorage on mount', () => {
    localStorage.setItem('invoice_logo', 'data:image/png;base64,xyz');
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('logo-url')).toHaveTextContent('data:image/png;base64,xyz');
  });

  it('ignores a localStorage value that does not start with data:image/', () => {
    localStorage.setItem('invoice_logo', 'not-a-data-url');
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });

  it('persists to localStorage when setLogoDataUrl is called', () => {
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    act(() => { screen.getByText('Set Logo').click(); });
    expect(localStorage.getItem('invoice_logo')).toBe('data:image/png;base64,abc');
    expect(screen.getByTestId('logo-url')).toHaveTextContent('data:image/png;base64,abc');
  });

  it('clears localStorage and resets state to null when removeLogo is called', () => {
    localStorage.setItem('invoice_logo', 'data:image/png;base64,xyz');
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    act(() => { screen.getByText('Remove Logo').click(); });
    expect(localStorage.getItem('invoice_logo')).toBeNull();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });

  it('degrades gracefully when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    // Should not throw; state is still updated in-memory
    act(() => { screen.getByText('Set Logo').click(); });
    expect(screen.getByTestId('logo-url')).toHaveTextContent('data:image/png;base64,abc');
  });

  it('degrades gracefully when localStorage.removeItem throws', () => {
    localStorage.setItem('invoice_logo', 'data:image/png;base64,xyz');
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    // Should not throw; state is still cleared in-memory
    act(() => { screen.getByText('Remove Logo').click(); });
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });

  it('degrades gracefully when localStorage.getItem throws on mount', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    // Falls back to null
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });
});
