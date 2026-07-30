// vi imported explicitly — globals: false (see vite.config.ts)
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { InvoiceForm } from './InvoiceForm';

const wrapper = ({ children }: { children: ReactNode }) => (
  <InvoiceProvider>{children}</InvoiceProvider>
);

function renderForm() {
  return render(<InvoiceForm />, { wrapper });
}

describe('InvoiceForm — labels and structure', () => {
  it('renders a Client Name input with associated label', () => {
    renderForm();
    expect(screen.getByLabelText('Client Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Client Name')).toHaveAttribute('id', 'client-name');
  });

  it('renders a Notes textarea with associated label', () => {
    renderForm();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toHaveAttribute('id', 'notes');
  });

  it('renders a Currency select with associated label', () => {
    renderForm();
    expect(screen.getByLabelText('Currency')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toHaveAttribute('id', 'currency');
  });

  it('renders the Submit Invoice button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Submit Invoice' })).toBeInTheDocument();
  });

  it('renders the Add line item button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Add line item' })).toBeInTheDocument();
  });

  it('client-name input has aria-describedby pointing to form-errors', () => {
    renderForm();
    expect(screen.getByLabelText('Client Name')).toHaveAttribute('aria-describedby', 'form-errors');
  });
});

describe('InvoiceForm — persistent live region', () => {
  it('always renders the form-errors live region in the DOM', () => {
    const { container } = renderForm();
    expect(container.querySelector('#form-errors')).toBeInTheDocument();
  });

  it('live region has static role=alert and aria-live=assertive', () => {
    const { container } = renderForm();
    const el = container.querySelector('#form-errors');
    expect(el).toHaveAttribute('role', 'alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('live region is visually hidden before any submission', () => {
    const { container } = renderForm();
    const el = container.querySelector('#form-errors');
    expect(el?.className).toContain('visually-hidden');
  });
});

describe('InvoiceForm — validation on submit', () => {
  it('shows "Client name is required." when client name is empty and form is submitted', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Submit Invoice' }));
    expect(screen.getByText('Client name is required.')).toBeInTheDocument();
  });

  it('shows "At least one line item is required." when no line items exist', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Submit Invoice' }));
    expect(screen.getByText('At least one line item is required.')).toBeInTheDocument();
  });

  it('live region is visible (not visually-hidden) after submit with errors', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Submit Invoice' }));
    const el = container.querySelector('#form-errors');
    expect(el?.className).not.toContain('visually-hidden');
  });

  it('re-announces errors on repeated identical submissions (CLEAR then SET)', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    // First submit
    await user.click(screen.getByRole('button', { name: 'Submit Invoice' }));
    const el = container.querySelector('#form-errors');
    expect(el).toHaveAttribute('role', 'alert');
    // Second submit — live region must still be present and visible
    await user.click(screen.getByRole('button', { name: 'Submit Invoice' }));
    expect(el).toBeInTheDocument();
    expect(el?.className).not.toContain('visually-hidden');
  });

  it('shows success status when form is valid', async () => {
    const user = userEvent.setup();
    renderForm();
    // Fill client name
    await user.type(screen.getByLabelText('Client Name'), 'Acme Corp');
    // Add a line item
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    // Submit
    await user.click(screen.getByRole('button', { name: 'Submit Invoice' }));
    expect(screen.getByText('Invoice submitted successfully.')).toBeInTheDocument();
  });

  it('does not show success message when there are validation errors', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Submit Invoice' }));
    expect(screen.queryByText('Invoice submitted successfully.')).not.toBeInTheDocument();
  });
});

describe('InvoiceForm — field wiring', () => {
  it('updates client name input value as user types', async () => {
    const user = userEvent.setup();
    renderForm();
    const input = screen.getByLabelText('Client Name');
    await user.type(input, 'Jane Doe');
    expect(input).toHaveValue('Jane Doe');
  });

  it('updates notes textarea value as user types', async () => {
    const user = userEvent.setup();
    renderForm();
    const textarea = screen.getByLabelText('Notes');
    await user.type(textarea, 'Net 30');
    expect(textarea).toHaveValue('Net 30');
  });

  it('currency select defaults to USD', () => {
    renderForm();
    expect(screen.getByLabelText('Currency')).toHaveValue('USD');
  });

  it('currency select updates when a new option is chosen', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.selectOptions(screen.getByLabelText('Currency'), 'EUR');
    expect(screen.getByLabelText('Currency')).toHaveValue('EUR');
  });
});
