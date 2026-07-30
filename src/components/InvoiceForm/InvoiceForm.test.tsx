/**
 * Tests for InvoiceForm — verifies WCAG AA structural requirements:
 *   - All inputs have associated labels
 *   - Error spans are always in the DOM
 *   - aria-invalid is set on invalid fields after submit
 *   - aria-live regions exist
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { InvoiceForm } from './InvoiceForm';

function renderForm() {
  return render(
    <InvoiceProvider>
      <InvoiceForm />
    </InvoiceProvider>
  );
}

describe('InvoiceForm accessibility', () => {
  it('renders a label for the invoice number input', () => {
    renderForm();
    expect(screen.getByLabelText(/invoice number/i)).toBeInTheDocument();
  });

  it('renders a label for the issue date input', () => {
    renderForm();
    expect(screen.getByLabelText(/issue date/i)).toBeInTheDocument();
  });

  it('renders a label for the due date input', () => {
    renderForm();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('error spans are in the DOM before submission (empty content)', () => {
    renderForm();
    expect(document.getElementById('invoice-number-error')).toBeInTheDocument();
    expect(document.getElementById('issue-date-error')).toBeInTheDocument();
    expect(document.getElementById('due-date-error')).toBeInTheDocument();
  });

  it('shows validation errors and sets aria-invalid after empty submit', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /save invoice/i }));
    expect(screen.getByText('Invoice number is required.')).toBeInTheDocument();
    expect(screen.getByLabelText(/invoice number/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('has a polite aria-live region', () => {
    renderForm();
    expect(document.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });

  it('has an assertive aria-live region', () => {
    renderForm();
    expect(document.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
  });

  it('shows success message when form is valid', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/invoice number/i), { target: { value: 'INV-001' } });
    fireEvent.change(screen.getByLabelText(/issue date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2024-01-31' } });
    fireEvent.click(screen.getByRole('button', { name: /save invoice/i }));
    expect(screen.getAllByText('Invoice saved successfully.').length).toBeGreaterThan(0);
  });

  it('shows due date error when due date is before issue date', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/invoice number/i), { target: { value: 'INV-001' } });
    fireEvent.change(screen.getByLabelText(/issue date/i), { target: { value: '2024-06-01' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2024-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /save invoice/i }));
    expect(screen.getByText('Due date must be on or after the issue date.')).toBeInTheDocument();
  });
});
