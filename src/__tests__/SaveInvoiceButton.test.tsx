import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { InvoiceProvider } from '../context/InvoiceContext';
import { SaveInvoiceButton } from '../components/SaveInvoiceButton';
import { loadInvoiceHistory } from '../services/invoiceStorage';
import { useInvoice } from '../context/InvoiceContext';
import { act } from '@testing-library/react';

function TestWrapper({ onSaved }: { onSaved?: () => void }) {
  const { dispatch } = useInvoice();
  React.useEffect(() => {
    dispatch({ type: 'SET_INVOICE_NUMBER', payload: 'INV-100' });
    dispatch({ type: 'SET_ISSUE_DATE', payload: '2024-05-10' });
  }, [dispatch]);
  return <SaveInvoiceButton onSaved={onSaved} />;
}

beforeEach(() => {
  localStorage.clear();
});

describe('SaveInvoiceButton', () => {
  it('clicking Save appends a new entry with correct label', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <TestWrapper />
      </InvoiceProvider>,
    );

    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    const history = loadInvoiceHistory();
    expect(history).toHaveLength(1);
    expect(history[0].label).toContain('INV-100');
    expect(history[0].label).toContain('2024-05-10');
  });

  it('clicking Save twice creates two separate entries', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <TestWrapper />
      </InvoiceProvider>,
    );

    await user.click(screen.getByRole('button', { name: /save invoice/i }));
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    const history = loadInvoiceHistory();
    expect(history).toHaveLength(2);
    expect(history[0].id).not.toBe(history[1].id);
  });

  it('snapshot contains verbatim issueDate (not recomputed)', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <TestWrapper />
      </InvoiceProvider>,
    );

    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    const history = loadInvoiceHistory();
    expect(history[0].snapshot.issueDate).toBe('2024-05-10');
  });

  it('onSaved callback is invoked after save', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(
      <InvoiceProvider>
        <TestWrapper onSaved={onSaved} />
      </InvoiceProvider>,
    );

    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
