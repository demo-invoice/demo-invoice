/**
 * InvoiceForm — T17 Accessibility: keyboard nav and screen reader labels.
 * Covers label/id pairing, aria-label, aria-describedby, aria-invalid,
 * aria-live error announcements, and dynamic Remove button labels.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

// ---------------------------------------------------------------------------
// Label / id pairing — every input must have a programmatically associated label
// ---------------------------------------------------------------------------
describe('InvoiceForm — label/id pairing', () => {
  it('associates a label with the Invoice Number input', () => {
    renderForm();
    expect(screen.getByLabelText('Invoice Number')).toBeInTheDocument();
  });

  it('associates a label with the Client Name input', () => {
    renderForm();
    expect(screen.getByLabelText('Client Name')).toBeInTheDocument();
  });

  it('associates a label with the Invoice Date input', () => {
    renderForm();
    expect(screen.getByLabelText('Invoice Date')).toBeInTheDocument();
  });

  it('associates a label with the Due Date input', () => {
    renderForm();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  });

  it('associates a label with the Currency select', () => {
    renderForm();
    expect(screen.getByLabelText('Currency')).toBeInTheDocument();
  });

  it('Invoice Number input has id="invoiceNumber"', () => {
    renderForm();
    expect(screen.getByLabelText('Invoice Number')).toHaveAttribute('id', 'invoiceNumber');
  });

  it('Currency control is a native select element', () => {
    renderForm();
    expect(screen.getByLabelText('Currency').tagName).toBe('SELECT');
  });
});

// ---------------------------------------------------------------------------
// Line-item row labels — Description / Quantity / Unit Price
// ---------------------------------------------------------------------------
describe('InvoiceForm — line item field labels', () => {
  it('has a labelled Description input for row 1', () => {
    renderForm();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();
  });

  it('has a labelled Quantity input for row 1', () => {
    renderForm();
    // type=number inputs are role=spinbutton
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeInTheDocument();
  });

  it('has a labelled Unit Price input for row 1', () => {
    renderForm();
    expect(screen.getByRole('spinbutton', { name: 'Unit Price' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Add Item button — must have aria-label="Add line item"
// ---------------------------------------------------------------------------
describe('InvoiceForm — Add Item button aria-label', () => {
  it('renders the Add Item button with aria-label="Add line item"', () => {
    renderForm();
    const btn = screen.getByRole('button', { name: 'Add line item' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', 'Add line item');
  });
});

// ---------------------------------------------------------------------------
// Remove button — dynamic aria-label reflecting 1-based row index
// ---------------------------------------------------------------------------
describe('InvoiceForm — Remove button dynamic aria-labels', () => {
  it('renders Remove button with aria-label="Remove item 1" for the initial row', () => {
    renderForm();
    const btn = screen.getByRole('button', { name: 'Remove item 1' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', 'Remove item 1');
  });

  it('disables the Remove button when only one row exists', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeDisabled();
  });

  it('adds a second row with aria-label="Remove item 2" after clicking Add line item', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('button', { name: 'Remove item 2' })).toBeInTheDocument();
  });

  it('enables Remove buttons when more than one row exists', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('button', { name: 'Remove item 1' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove item 2' })).not.toBeDisabled();
  });

  it('reindexes Remove labels after a middle row is removed', async () => {
    const user = userEvent.setup();
    renderForm();
    // Build up to 3 rows
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('button', { name: 'Remove item 3' })).toBeInTheDocument();
    // Remove the middle row
    await user.click(screen.getByRole('button', { name: 'Remove item 2' }));
    // Former row 3 must now be labelled row 2
    expect(screen.getByRole('button', { name: 'Remove item 2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove item 3' })).not.toBeInTheDocument();
  });

  it('removes a row and leaves exactly the correct number of Remove buttons', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    await user.click(screen.getByRole('button', { name: 'Remove item 1' }));
    // Only one row should remain
    expect(screen.getAllByRole('button', { name: /^Remove item/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Validation errors — aria-describedby, aria-invalid, aria-live
// ---------------------------------------------------------------------------
describe('InvoiceForm — validation error accessibility', () => {
  it('shows error text when the form is submitted empty', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Invoice form' }));
    expect(await screen.findByText('Invoice number is required.')).toBeInTheDocument();
    expect(await screen.findByText('Client name is required.')).toBeInTheDocument();
    expect(await screen.findByText('Invoice date is required.')).toBeInTheDocument();
    expect(await screen.findByText('Due date is required.')).toBeInTheDocument();
  });

  it('sets aria-invalid="true" on the Invoice Number input after failed submit', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Invoice form' }));
    const input = await screen.findByLabelText('Invoice Number');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid="true" on the Client Name input after failed submit', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Invoice form' }));
    const input = await screen.findByLabelText('Client Name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('links Invoice Number input to its error via aria-describedby', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Invoice form' }));
    const input = await screen.findByLabelText('Invoice Number');
    expect(input).toHaveAttribute('aria-describedby', 'invoiceNumber-error');
    expect(screen.getByText('Invoice number is required.')).toHaveAttribute(
      'id',
      'invoiceNumber-error',
    );
  });

  it('links Client Name input to its error via aria-describedby', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Invoice form' }));
    const input = await screen.findByLabelText('Client Name');
    expect(input).toHaveAttribute('aria-describedby', 'clientName-error');
    expect(screen.getByText('Client name is required.')).toHaveAttribute(
      'id',
      'clientName-error',
    );
  });

  it('renders the error summary with role="alert" after failed submit', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Invoice form' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('error summary contains the top-level error messages', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Invoice form' }));
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Invoice number is required.')).toBeInTheDocument();
    expect(within(alert).getByText('Client name is required.')).toBeInTheDocument();
  });

  it('clears errors and re-announces them on a second failed submit', async () => {
    const user = userEvent.setup();
    renderForm();
    const form = screen.getByRole('form', { name: 'Invoice form' });
    fireEvent.submit(form);
    await screen.findByText('Invoice number is required.');
    // Second submit — errors should still be present
    fireEvent.submit(form);
    expect(await screen.findByText('Invoice number is required.')).toBeInTheDocument();
  });

  it('does not show aria-invalid on Invoice Number before any submit', () => {
    renderForm();
    const input = screen.getByLabelText('Invoice Number');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('does not show aria-describedby on Invoice Number before any submit', () => {
    renderForm();
    const input = screen.getByLabelText('Invoice Number');
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});

// ---------------------------------------------------------------------------
// Currency dropdown — keyboard-navigable native select
// ---------------------------------------------------------------------------
describe('InvoiceForm — currency dropdown', () => {
  it('renders the currency select with id="currency"', () => {
    renderForm();
    expect(screen.getByLabelText('Currency')).toHaveAttribute('id', 'currency');
  });

  it('currency select has name="currency"', () => {
    renderForm();
    expect(screen.getByLabelText('Currency')).toHaveAttribute('name', 'currency');
  });

  it('currency select defaults to USD', () => {
    renderForm();
    expect(screen.getByLabelText('Currency')).toHaveValue('USD');
  });

  it('currency select contains all expected options', () => {
    renderForm();
    const select = screen.getByLabelText('Currency') as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toContain('USD');
    expect(values).toContain('EUR');
    expect(values).toContain('GBP');
    expect(values).toContain('JPY');
    expect(values).toContain('CAD');
    expect(values).toContain('AUD');
  });

  it('updates the selected currency when the user changes the select', async () => {
    const user = userEvent.setup();
    renderForm();
    const select = screen.getByLabelText('Currency');
    await user.selectOptions(select, 'EUR');
    expect(select).toHaveValue('EUR');
  });
});

// ---------------------------------------------------------------------------
// Line item row group labelling
// ---------------------------------------------------------------------------
describe('InvoiceForm — line item row group', () => {
  it('wraps each row in a group with aria-label="Line item 1"', () => {
    renderForm();
    expect(screen.getByRole('group', { name: 'Line item 1' })).toBeInTheDocument();
  });

  it('adds a group labelled "Line item 2" after adding a row', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('group', { name: 'Line item 2' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Form structure — landmark and heading
// ---------------------------------------------------------------------------
describe('InvoiceForm — form structure', () => {
  it('renders the form with aria-label="Invoice form"', () => {
    renderForm();
    expect(screen.getByRole('form', { name: 'Invoice form' })).toBeInTheDocument();
  });

  it('renders a Submit Invoice button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Submit Invoice' })).toBeInTheDocument();
  });
});
