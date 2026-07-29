import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { InvoicePreview } from './InvoicePreview.jsx';
import { InvoiceProvider } from '../../context/InvoiceContext.jsx';

describe('InvoicePreview', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the grey placeholder when no logo is stored', () => {
    render(
      <InvoiceProvider>
        <InvoicePreview />
      </InvoiceProvider>
    );
    expect(screen.getByLabelText('Logo placeholder')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the logo image when a valid data URL is in localStorage', () => {
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
});
