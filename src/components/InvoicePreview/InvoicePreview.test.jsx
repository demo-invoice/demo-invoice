import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoicePreview } from './InvoicePreview.jsx';
import { InvoiceProvider, useInvoice } from '../../context/InvoiceContext.jsx';

// Mock SendEmailModal so InvoicePreview tests stay focused on their own responsibility
vi.mock('../SendEmailModal/SendEmailModal.jsx', () => ({
  SendEmailModal: ({ isOpen }) =>
    isOpen ? <div data-testid="send-email-modal-mock" /> : null,
}));

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

  it('renders the invoice preview section with accessible label', () => {
    render(
      <InvoiceProvider>
        <InvoicePreview />
      </InvoiceProvider>
    );
    expect(screen.getByRole('region', { name: 'Invoice preview' })).toBeInTheDocument();
  });

  // T24: Send by Email button
  it('renders a "Send by Email" button', () => {
    render(
      <InvoiceProvider>
        <InvoicePreview />
      </InvoiceProvider>
    );
    expect(
      screen.getByRole('button', { name: /send by email/i })
    ).toBeInTheDocument();
  });

  it('clicking "Send by Email" opens the SendEmailModal without throwing', () => {
    render(
      <InvoiceProvider>
        <InvoicePreview />
      </InvoiceProvider>
    );

    expect(screen.queryByTestId('send-email-modal-mock')).not.toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: /send by email/i }).click();
    });

    expect(screen.getByTestId('send-email-modal-mock')).toBeInTheDocument();
  });
});
