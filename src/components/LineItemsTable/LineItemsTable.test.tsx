import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LineItemsTable } from './LineItemsTable';
import { InvoiceProvider } from '../../context/InvoiceContext';

function renderWithProvider() {
  return render(
    <InvoiceProvider>
      <LineItemsTable />
    </InvoiceProvider>,
  );
}

describe('LineItemsTable', () => {
  // ── Structure ──────────────────────────────────────────────────────────

  it('renders the table element', () => {
    const { container } = renderWithProvider();
    expect(container.querySelector('.line-items-table')).toBeInTheDocument();
  });

  it('renders the thead with column headers', () => {
    const { container } = renderWithProvider();
    const thead = container.querySelector('.line-items-table__head');
    expect(thead).toBeInTheDocument();
    expect(thead?.textContent).toContain('Description');
    expect(thead?.textContent).toContain('Qty');
    expect(thead?.textContent).toContain('Unit Price');
    expect(thead?.textContent).toContain('Amount');
  });

  it('renders at least one body row on initial load', () => {
    const { container } = renderWithProvider();
    const rows = container.querySelectorAll('.line-items-table__row');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  // ── data-label attributes (mobile card accessibility) ──────────────────

  it('description td carries data-label="Description"', () => {
    const { container } = renderWithProvider();
    const descTd = container.querySelector('.line-items-table__td--desc');
    expect(descTd).toHaveAttribute('data-label', 'Description');
  });

  it('qty td carries data-label="Qty"', () => {
    const { container } = renderWithProvider();
    // First numeric td in the first row is Qty
    const numTds = container.querySelectorAll(
      '.line-items-table__row .line-items-table__td--num',
    );
    expect(numTds[0]).toHaveAttribute('data-label', 'Qty');
  });

  it('unit price td carries data-label="Unit Price"', () => {
    const { container } = renderWithProvider();
    const numTds = container.querySelectorAll(
      '.line-items-table__row .line-items-table__td--num',
    );
    expect(numTds[1]).toHaveAttribute('data-label', 'Unit Price');
  });

  it('amount td carries data-label="Amount"', () => {
    const { container } = renderWithProvider();
    const numTds = container.querySelectorAll(
      '.line-items-table__row .line-items-table__td--num',
    );
    expect(numTds[2]).toHaveAttribute('data-label', 'Amount');
  });

  // ── Inputs ─────────────────────────────────────────────────────────────

  it('renders a description input with placeholder "Item description"', () => {
    renderWithProvider();
    expect(
      screen.getByPlaceholderText('Item description'),
    ).toBeInTheDocument();
  });

  it('renders a quantity input with aria-label "Quantity"', () => {
    renderWithProvider();
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeInTheDocument();
  });

  it('renders a unit price input with aria-label "Unit price"', () => {
    renderWithProvider();
    expect(screen.getByRole('spinbutton', { name: 'Unit price' })).toBeInTheDocument();
  });

  // ── Add line item ──────────────────────────────────────────────────────

  it('renders the "+ Add Line Item" button', () => {
    renderWithProvider();
    expect(
      screen.getByRole('button', { name: '+ Add Line Item' }),
    ).toBeInTheDocument();
  });

  it('adds a new row when "+ Add Line Item" is clicked', () => {
    const { container } = renderWithProvider();
    const addBtn = screen.getByRole('button', { name: '+ Add Line Item' });
    fireEvent.click(addBtn);
    const rows = container.querySelectorAll('.line-items-table__row');
    expect(rows.length).toBe(2);
  });

  it('add-row td is inside a tfoot row', () => {
    const { container } = renderWithProvider();
    const addRow = container.querySelector('.line-items-table__add-row');
    expect(addRow).toBeInTheDocument();
    // The add-row lives inside tfoot
    expect(addRow?.closest('tfoot')).toBeInTheDocument();
  });

  // ── Remove line item ───────────────────────────────────────────────────

  it('remove button is disabled when only one line item exists', () => {
    renderWithProvider();
    const removeBtn = screen.getByRole('button', { name: /remove line item/i });
    expect(removeBtn).toBeDisabled();
  });

  it('remove button is enabled when more than one line item exists', () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole('button', { name: '+ Add Line Item' }));
    const removeBtns = screen.getAllByRole('button', { name: /remove line item/i });
    removeBtns.forEach((btn) => expect(btn).not.toBeDisabled());
  });

  it('removes a row when the remove button is clicked', () => {
    const { container } = renderWithProvider();
    // Add a second row first so remove is enabled
    fireEvent.click(screen.getByRole('button', { name: '+ Add Line Item' }));
    expect(container.querySelectorAll('.line-items-table__row').length).toBe(2);
    const removeBtns = screen.getAllByRole('button', { name: /remove line item/i });
    fireEvent.click(removeBtns[0]);
    expect(container.querySelectorAll('.line-items-table__row').length).toBe(1);
  });

  // ── Subtotal ───────────────────────────────────────────────────────────

  it('renders the subtotal row', () => {
    const { container } = renderWithProvider();
    expect(
      container.querySelector('.line-items-table__subtotal-row'),
    ).toBeInTheDocument();
  });

  it('subtotal label cell contains "Subtotal"', () => {
    const { container } = renderWithProvider();
    const labelCell = container.querySelector(
      '.line-items-table__td--subtotal-label',
    );
    expect(labelCell?.textContent).toContain('Subtotal');
  });

  it('displays $0.00 subtotal when all quantities and prices are zero', () => {
    renderWithProvider();
    // Default initial state: quantity=1, unitPrice=0 → $0.00
    const valueCell = screen
      .getAllByText('$0.00')
      .find((el) =>
        el.classList.contains('line-items-table__td--subtotal-value'),
      );
    expect(valueCell).toBeInTheDocument();
  });

  // ── Overflow wrapper ───────────────────────────────────────────────────

  it('wraps the table in .line-items-wrapper', () => {
    const { container } = renderWithProvider();
    const wrapper = container.querySelector('.line-items-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector('.line-items-table')).toBeInTheDocument();
  });
});
