// globals: true — describe/it/expect/vi are injected by vitest; do NOT import them
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceForm } from '../components/InvoiceForm/InvoiceForm';

function setup() {
  const user = userEvent.setup();
  const utils = render(
    <InvoiceProvider>
      <InvoiceForm />
    </InvoiceProvider>,
  );
  return { user, ...utils };
}

describe('InvoiceForm', () => {
  it('renders all labelled fields', () => {
    setup();
    expect(screen.getByLabelText('Invoice Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Issue Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Client Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    setup();
    expect(screen.getByRole('button', { name: /submit invoice/i })).toBeInTheDocument();
  });

  it('renders the Add item button with aria-label', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    // Wait for setTimeout(0) to fire
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(screen.getByText('Invoice number is required.')).toBeInTheDocument();
    expect(screen.getByText('Client name is required.')).toBeInTheDocument();
  });

  it('updates invoice number field on input', async () => {
    const { user } = setup();
    const input = screen.getByLabelText('Invoice Number');
    await user.type(input, 'INV-2024-001');
    expect(input).toHaveValue('INV-2024-001');
  });

  it('updates client name field on input', async () => {
    const { user } = setup();
    const input = screen.getByLabelText('Client Name');
    await user.type(input, 'Acme Corp');
    expect(input).toHaveValue('Acme Corp');
  });

  it('has aria-describedby on invoice number pointing to error span', () => {
    setup();
    const input = screen.getByLabelText('Invoice Number');
    expect(input).toHaveAttribute('aria-describedby', 'invoiceNumber-error');
    expect(document.getElementById('invoiceNumber-error')).toBeInTheDocument();
  });

  it('has aria-describedby on issue date pointing to error span', () => {
    setup();
    const input = screen.getByLabelText('Issue Date');
    expect(input).toHaveAttribute('aria-describedby', 'issueDate-error');
    expect(document.getElementById('issueDate-error')).toBeInTheDocument();
  });

  it('has aria-describedby on due date pointing to error span', () => {
    setup();
    const input = screen.getByLabelText('Due Date');
    expect(input).toHaveAttribute('aria-describedby', 'dueDate-error');
    expect(document.getElementById('dueDate-error')).toBeInTheDocument();
  });

  it('adds a line item row when Add item is clicked', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByLabelText('Remove item 1')).toBeInTheDocument();
  });

  it('removes a line item when Remove is clicked', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByLabelText('Remove item 1')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Remove item 1'));
    expect(screen.queryByLabelText('Remove item 1')).not.toBeInTheDocument();
  });

  it('clears line items error after adding an item', async () => {
    const { user } = setup();
    // Submit to trigger errors
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(screen.getByText('At least one line item is required.')).toBeInTheDocument();
    // Add an item — then re-submit with other fields filled
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    await user.type(screen.getByLabelText('Invoice Number'), 'INV-1');
    await user.type(screen.getByLabelText('Client Name'), 'Test Client');
    // Fill dates
    await user.type(screen.getByLabelText('Issue Date'), '2024-01-01');
    await user.type(screen.getByLabelText('Due Date'), '2024-01-31');
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(screen.queryByText('At least one line item is required.')).not.toBeInTheDocument();
  });
});
