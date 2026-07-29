import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceProvider, useInvoice } from './InvoiceContext.jsx';

/** Simple consumer component for testing context values. */
function Consumer() {
  const { logoDataUrl, setLogoDataUrl, removeLogo } = useInvoice();
  return (
    <div>
      <span data-testid="logo-url">{logoDataUrl ?? 'null'}</span>
      <button onClick={() => setLogoDataUrl('data:image/png;base64,abc')}>
        Set Logo
      </button>
      <button onClick={removeLogo}>Remove Logo</button>
    </div>
  );
}

describe('InvoiceContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initialises with null when localStorage is empty', () => {
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });

  it('rehydrates from localStorage on mount', () => {
    localStorage.setItem('invoice_logo', 'data:image/png;base64,xyz');
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    expect(screen.getByTestId('logo-url')).toHaveTextContent(
      'data:image/png;base64,xyz'
    );
  });

  it('persists to localStorage when setLogoDataUrl is called', () => {
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    act(() => {
      screen.getByText('Set Logo').click();
    });
    expect(localStorage.getItem('invoice_logo')).toBe(
      'data:image/png;base64,abc'
    );
    expect(screen.getByTestId('logo-url')).toHaveTextContent(
      'data:image/png;base64,abc'
    );
  });

  it('clears localStorage and state when removeLogo is called', () => {
    localStorage.setItem('invoice_logo', 'data:image/png;base64,xyz');
    render(
      <InvoiceProvider>
        <Consumer />
      </InvoiceProvider>
    );
    act(() => {
      screen.getByText('Remove Logo').click();
    });
    expect(localStorage.getItem('invoice_logo')).toBeNull();
    expect(screen.getByTestId('logo-url')).toHaveTextContent('null');
  });
});
