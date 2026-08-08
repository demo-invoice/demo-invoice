import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoicePreview } from './InvoicePreview.jsx';
import { InvoiceContext, InvoiceProvider, useInvoice } from '../../context/InvoiceContext.jsx';

/** Minimal invoice fixture covering all fields InvoicePreview destructures. */
const baseInvoice = {
  lineItems: [],
  clientName: 'Acme Corp',
  clientEmail: 'acme@example.com',
  invoiceNumber: 'INV-001',
  status: 'draft',
  logoUrl: null,
  logoDataUrl: null,
  yourDetails: { name: 'Jane Dev', email: 'jane@dev.io', address: '1 Main St' },
  currency: 'USD',
};

/**
 * Render InvoicePreview wrapped in a real InvoiceContext.Provider seeded with
 * the given state, so the component reads from useInvoice() as it actually does.
 * @param {object} invoiceState - Partial overrides merged onto baseInvoice.
 */
function renderWithInvoice(invoiceState = {}) {
  const value = {
    ...baseInvoice,
    ...invoiceState,
    dispatch: vi.fn(),
    // Provide no-op helpers in case the component calls them
    setLogoDataUrl: vi.fn(),
    removeLogo: vi.fn(),
  };
  return render(
    <InvoiceContext.Provider value={value}>
      <InvoicePreview />
    </InvoiceContext.Provider>
  );
}

describe('InvoicePreview', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // --- Logo rendering ---

  it('renders a logo img when logoDataUrl is set to a data URL', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    renderWithInvoice({ logoDataUrl: dataUrl });
    // The img element must be present in the document
    const img = screen.getByRole('img', { name: /logo/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', dataUrl);
  });

  it('does not render a logo img when logoDataUrl is null', () => {
    renderWithInvoice({ logoDataUrl: null });
    expect(screen.queryByRole('img', { name: /logo/i })).not.toBeInTheDocument();
  });

  it('does not render a logo img when logoDataUrl is an empty string', () => {
    renderWithInvoice({ logoDataUrl: '' });
    expect(screen.queryByRole('img', { name: /logo/i })).not.toBeInTheDocument();
  });

  // --- Content rendering ---

  it('renders the invoice preview region with an accessible label', () => {
    renderWithInvoice();
    expect(screen.getByRole('region', { name: /invoice preview/i })).toBeInTheDocument();
  });

  it('renders the client name from context', () => {
    renderWithInvoice({ clientName: 'Globex Inc' });
    expect(screen.getByText('Globex Inc')).toBeInTheDocument();
  });

  it('renders the invoice number from context', () => {
    renderWithInvoice({ invoiceNumber: 'INV-042' });
    expect(screen.getByText(/INV-042/)).toBeInTheDocument();
  });

  // --- InvoiceProvider integration (shared state) ---

  it('renders the grey placeholder when no logo is stored (InvoiceProvider)', () => {
    render(
      <InvoiceProvider>
        <InvoicePreview />
      </InvoiceProvider>
    );
    expect(screen.getByLabelText('Logo placeholder')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the logo image when a valid data URL is in localStorage (InvoiceProvider)', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    localStorage.setItem('invoice_logo', dataUrl);

    render(
      <InvoiceProvider>
        <InvoicePreview />
      </InvoiceProvider>
    );

    const img = screen.getByRole('img', { name: 'Business logo' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', dataUrl);
    expect(screen.queryByLabelText('Logo placeholder')).not.toBeInTheDocument();
  });

  it('discards a stale/corrupt localStorage value that lacks data:image/ prefix', () => {
    localStorage.setItem('invoice_logo', 'corrupt-value');

    render(
      <InvoiceProvider>
        <InvoicePreview />
      </InvoiceProvider>
    );

    expect(screen.getByLabelText('Logo placeholder')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('logo image has max-width of 200px, max-height of 100px, and object-fit contain', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    localStorage.setItem('invoice_logo', dataUrl);

    render(
      <InvoiceProvider>
        <InvoicePreview />
      </InvoiceProvider>
    );

    const img = screen.getByRole('img', { name: 'Business logo' });
    expect(img).toHaveStyle({ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' });
  });

  it('replaces the placeholder with the logo image when shared state is updated (no reload)', async () => {
    function Driver() {
      const { setLogoDataUrl } = useInvoice();
      return (
        <button onClick={() => setLogoDataUrl('data:image/jpeg;base64,xyz')}>
          Load
        </button>
      );
    }

    render(
      <InvoiceProvider>
        <Driver />
        <InvoicePreview />
      </InvoiceProvider>
    );

    expect(screen.getByLabelText('Logo placeholder')).toBeInTheDocument();

    act(() => {
      screen.getByText('Load').click();
    });

    expect(screen.queryByLabelText('Logo placeholder')).not.toBeInTheDocument();
    const img = screen.getByRole('img', { name: 'Business logo' });
    expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,xyz');
  });

  it('restores the grey placeholder when the logo is removed from shared state', async () => {
    function Driver() {
      const { setLogoDataUrl, removeLogo } = useInvoice();
      return (
        <>
          <button onClick={() => setLogoDataUrl('data:image/png;base64,abc')}>Load</button>
          <button onClick={removeLogo}>Remove</button>
        </>
      );
    }

    render(
      <InvoiceProvider>
        <Driver />
        <InvoicePreview />
      </InvoiceProvider>
    );

    act(() => { screen.getByText('Load').click(); });
    expect(screen.getByRole('img', { name: 'Business logo' })).toBeInTheDocument();

    act(() => { screen.getByText('Remove').click(); });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Logo placeholder')).toBeInTheDocument();
  });
});
