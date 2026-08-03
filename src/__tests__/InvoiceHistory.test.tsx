import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceHistory } from '../components/InvoiceHistory';
import { appendInvoiceHistory, loadInvoiceHistory } from '../services/invoiceStorage';
import type { SavedInvoiceEntry, InvoiceState } from '../types/invoice';
import { useInvoice } from '../context/InvoiceContext';

const snapshot1: InvoiceState = {
  invoiceNumber: 'INV-001',
  issueDate: '2024-01-10',
  dueDate: '2024-02-10',
  from: 'Sender A',
  to: 'Recipient A',
  lineItems: [],
};

const snapshot2: InvoiceState = {
  invoiceNumber: 'INV-002',
  issueDate: '2024-03-01',
  dueDate: '2024-04-01',
  from: 'Sender B',
  to: 'Recipient B',
  lineItems: [],
};

const entry1: SavedInvoiceEntry = {
  id: 'e1',
  label: 'INV-001 — 2024-01-10',
  savedAt: '2024-01-10T09:00:00.000Z',
  snapshot: snapshot1,
};

const entry2: SavedInvoiceEntry = {
  id: 'e2',
  label: 'INV-002 — 2024-03-01',
  savedAt: '2024-03-01T09:00:00.000Z',
  snapshot: snapshot2,
};

beforeEach(() => {
  localStorage.clear();
});

describe('InvoiceHistory', () => {
  it('renders all saved entries with label and Load button', () => {
    render(
      <InvoiceProvider>
        <InvoiceHistory savedInvoices={[entry1, entry2]} onLoad={() => undefined} />
      </InvoiceProvider>,
    );

    expect(screen.getByText('INV-001 — 2024-01-10')).toBeInTheDocument();
    expect(screen.getByText('INV-002 — 2024-03-01')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /load/i })).toHaveLength(2);
  });

  it('shows empty-state message when list is empty', () => {
    render(
      <InvoiceProvider>
        <InvoiceHistory savedInvoices={[]} onLoad={() => undefined} />
      </InvoiceProvider>,
    );

    expect(screen.getByText(/no saved invoices yet/i)).toBeInTheDocument();
  });

  it('clicking Load dispatches LOAD_SAVED_INVOICE and updates state', async () => {
    const user = userEvent.setup();

    let capturedState: InvoiceState | null = null;
    function StateCapture() {
      const { state } = useInvoice();
      capturedState = state;
      return null;
    }

    function TestApp() {
      const { dispatch } = useInvoice();
      return (
        <>
          <StateCapture />
          <InvoiceHistory
            savedInvoices={[entry1]}
            onLoad={(entry) =>
              dispatch({ type: 'LOAD_SAVED_INVOICE', payload: entry.snapshot })
            }
          />
        </>
      );
    }

    render(
      <InvoiceProvider>
        <TestApp />
      </InvoiceProvider>,
    );

    await user.click(screen.getByRole('button', { name: /load/i }));

    expect(capturedState?.invoiceNumber).toBe('INV-001');
    expect(capturedState?.issueDate).toBe('2024-01-10');
  });

  it('history list survives simulated page reload (re-read from localStorage)', () => {
    appendInvoiceHistory(entry1);
    appendInvoiceHistory(entry2);

    // Simulate reload: read fresh from localStorage
    const reloaded = loadInvoiceHistory();
    expect(reloaded).toHaveLength(2);
    expect(reloaded[0].id).toBe('e1');
    expect(reloaded[1].id).toBe('e2');
  });
});
