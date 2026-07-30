import { render, screen } from '@testing-library/react';
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

describe('InvoiceForm', () => {
  it('renders the form heading', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: /create invoice/i })).toBeInTheDocument();
  });

  it('renders labelled inputs for invoice fields', () => {
    renderForm();
    expect(screen.getByLabelText(/invoice number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/issue date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('renders the currency dropdown with a label', () => {
    renderForm();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
  });

  it('renders the Add Item button with a descriptive aria-label', () => {
    renderForm();
    expect(
      screen.getByRole('button', { name: /add line item/i }),
    ).toBeInTheDocument();
  });

  it('renders remove buttons with dynamic aria-labels', () => {
    renderForm();
    expect(
      screen.getByRole('button', { name: /remove item 1/i }),
    ).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /save invoice/i }));
    expect(await screen.findByText(/invoice number is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/client name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/issue date is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/due date is required/i)).toBeInTheDocument();
  });

  it('adds a new line item row when Add Item is clicked', async () => {
    renderForm();
    const user = userEvent.setup();
    const addButton = screen.getByRole('button', { name: /add line item/i });
    await user.click(addButton);
    expect(screen.getByRole('button', { name: /remove item 2/i })).toBeInTheDocument();
  });

  it('removes a line item row when its remove button is clicked', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /add line item/i }));
    expect(screen.getByRole('button', { name: /remove item 2/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove item 1/i }));
    expect(screen.queryByRole('button', { name: /remove item 2/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove item 1/i })).toBeInTheDocument();
  });

  it('updates invoice number field on input', async () => {
    renderForm();
    const user = userEvent.setup();
    const input = screen.getByLabelText(/invoice number/i);
    await user.type(input, 'INV-001');
    expect(input).toHaveValue('INV-001');
  });

  it('currency dropdown is keyboard navigable as a native select', () => {
    renderForm();
    const select = screen.getByLabelText(/currency/i);
    expect(select.tagName).toBe('SELECT');
  });

  it('validation errors are associated with inputs via aria-describedby', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /save invoice/i }));
    const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
    expect(await screen.findByText(/invoice number is required/i)).toBeInTheDocument();
    const errorId = invoiceNumberInput.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toBeInTheDocument();
  });

  it('line item description field has an associated label', () => {
    renderForm();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('line item quantity field has an associated label', () => {
    renderForm();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
  });

  it('line item unit price field has an associated label', () => {
    renderForm();
    expect(screen.getByLabelText(/unit price/i)).toBeInTheDocument();
  });
});
