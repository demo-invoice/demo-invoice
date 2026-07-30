/**
 * InvoiceForm accessibility and behaviour tests.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { InvoiceForm } from './InvoiceForm';

function renderForm() {
  return render(
    <InvoiceProvider>
      <InvoiceForm />
    </InvoiceProvider>,
  );
}

describe('InvoiceForm — label/id pairing', () => {
  it('has a label associated with the invoice number input', () => {
    renderForm();
    expect(screen.getByLabelText('Invoice Number')).toBeInTheDocument();
  });

  it('has a label associated with the client name input', () => {
    renderForm();
    expect(screen.getByLabelText('Client Name')).toBeInTheDocument();
  });

  it('has a label associated with the invoice date input', () => {
    renderForm();
    expect(screen.getByLabelText('Invoice Date')).toBeInTheDocument();
  });

  it('has a label associated with the due date input', () => {
    renderForm();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  });

  it('has a label associated with the currency select', () => {
    renderForm();
    expect(screen.getByLabelText('Currency')).toBeInTheDocument();
  });
});

describe('InvoiceForm — validation', () => {
  it('shows error messages when submitted empty', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Invoice form' }));
    expect(await screen.findByText('Invoice number is required.')).toBeInTheDocument();
    expect(await screen.findByText('Client name is required.')).toBeInTheDocument();
  });

  it('marks invalid inputs with aria-invalid', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Invoice form' }));
    const invoiceInput = await screen.findByLabelText('Invoice Number');
    expect(invoiceInput).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('InvoiceForm — line items', () => {
  it('renders the Add Item button with correct aria-label', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Add line item' })).toBeInTheDocument();
  });

  it('renders the Remove button with dynamic aria-label for row 1', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeInTheDocument();
  });

  it('adds a new row when Add Item is clicked', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('button', { name: 'Remove item 2' })).toBeInTheDocument();
  });

  it('updates Remove button aria-labels after a middle row is removed', async () => {
    const user = userEvent.setup();
    renderForm();
    // Add two more rows (total 3)
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    // Remove row 2
    await user.click(screen.getByRole('button', { name: 'Remove item 2' }));
    // Row formerly labelled 3 should now be labelled 2
    expect(screen.getByRole('button', { name: 'Remove item 2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove item 3' })).not.toBeInTheDocument();
  });

  it('disables Remove button when only one row remains', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeDisabled();
  });
});

describe('InvoiceForm — line item labels', () => {
  it('has labelled Description input for row 1', () => {
    renderForm();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();
  });
});
