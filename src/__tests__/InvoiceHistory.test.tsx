import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InvoiceHistory } from '../components/InvoiceHistory';
import { InvoiceProvider } from '../context/InvoiceContext';
import type { SavedInvoiceEntry } from '../types/invoice';

const MOCK_ENTRY: SavedInvoiceEntry = {
  id: 'test-id-1',
  label: 'INV-001 — 2024-01-15',
  savedAt: '2024-01-15T10:00:00.000Z',
  snapshot: {
    invoiceNumber: 'INV-001',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    from: 'Acme Corp',
    to: 'Client Ltd',
    lineItems: [],
  },
};

const MOCK_ENTRY_2: SavedInvoiceEntry = {
  id: 'test-id-2',
  label: 'INV-002 — 2024-02-20',
  savedAt: '2024-02-20T12:00:00.000Z',
  snapshot: {
    invoiceNumber: 'INV-002',
    issueDate: '2024-02-20',
    dueDate: '2024-03-20',
    from: 'Acme Corp',
    to: 'Another Client',
    lineItems: [],
  },
};

function renderWithProvider(ui: React.ReactElement) {
  return render(<InvoiceProvider>{ui}</InvoiceProvider>);
}

beforeEach(() => {
  localStorage.clear();
});

describe('InvoiceHistory', () => {
  it('shows empty state when no invoices are saved', () => {
    renderWithProvider(<InvoiceHistory savedInvoices={[]} onLoad={vi.fn()} />);
    expect(screen.getByText(/no saved invoices/i)).toBeInTheDocument();
  });

  it('renders a list entry for each saved invoice', () => {
    renderWithProvider(
      <InvoiceHistory savedInvoices={[MOCK_ENTRY, MOCK_ENTRY_2]} onLoad={vi.fn()} />
    );
    expect(screen.getByText('INV-001 — 2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('INV-002 — 2024-02-20')).toBeInTheDocument();
  });

  it('renders a Load button for each entry', () => {
    renderWithProvider(
      <InvoiceHistory savedInvoices={[MOCK_ENTRY, MOCK_ENTRY_2]} onLoad={vi.fn()} />
    );
    const loadButtons = screen.getAllByRole('button', { name: /load/i });
    expect(loadButtons).toHaveLength(2);
  });

  it('calls onLoad with the correct entry when Load is clicked', () => {
    const onLoad = vi.fn();
    renderWithProvider(
      <InvoiceHistory savedInvoices={[MOCK_ENTRY, MOCK_ENTRY_2]} onLoad={onLoad} />
    );
    const loadButtons = screen.getAllByRole('button', { name: /load/i });
    fireEvent.click(loadButtons[0]);
    expect(onLoad).toHaveBeenCalledWith(MOCK_ENTRY);
  });

  it('history persists across simulated page reloads', () => {
    const { loadInvoiceHistory, appendInvoiceHistory } = require('../services/invoiceStorage');
    appendInvoiceHistory(MOCK_ENTRY);
    appendInvoiceHistory(MOCK_ENTRY_2);
    const reloaded = loadInvoiceHistory();
    expect(reloaded).toHaveLength(2);
    expect(reloaded[0].id).toBe('test-id-1');
    expect(reloaded[1].id).toBe('test-id-2');
  });

  it('handles malformed localStorage data gracefully', () => {
    localStorage.setItem('invoice_history', 'not-valid-json{{{');
    const { loadInvoiceHistory } = require('../services/invoiceStorage');
    const result = loadInvoiceHistory();
    expect(result).toEqual([]);
  });

  it('stores issueDate as-is at save time and restores it on load', () => {
    const { appendInvoiceHistory, loadInvoiceHistory } = require('../services/invoiceStorage');
    appendInvoiceHistory(MOCK_ENTRY);
    const parsed = JSON.parse(localStorage.getItem('invoice_history')!) as import('../types/invoice').SavedInvoiceEntry[];
    expect(parsed[0].snapshot.invoiceNumber).toBe('INV-001');
    expect(parsed[0].snapshot.issueDate).toBe('2024-01-15');
  });
});
