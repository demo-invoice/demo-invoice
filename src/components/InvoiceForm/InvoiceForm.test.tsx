import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { InvoiceForm } from './InvoiceForm';

function renderForm() {
  return render(
    <InvoiceProvider>
      <InvoiceForm />
    </InvoiceProvider>,
  );
}

describe('InvoiceForm — accessibility', () => {
  it('has zero critical/serious axe violations on initial render', async () => {
    const { container } = renderForm();
    const results = await axe.run(container);
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(blocking).toHaveLength(0);
  });

  it('client name input has an associated label', () => {
    renderForm();
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
  });

  it('client email input has an associated label', () => {
    renderForm();
    expect(screen.getByLabelText(/client email/i)).toBeInTheDocument();
  });

  it('ValidationError for clientName is in the DOM before submission', () => {
    const { container } = renderForm();
    expect(container.querySelector('#error-clientName')).toBeInTheDocument();
  });

  it('ValidationError for clientEmail is in the DOM before submission', () => {
    const { container } = renderForm();
    expect(container.querySelector('#error-clientEmail')).toBeInTheDocument();
  });

  it('clientName input references its live region via aria-describedby', () => {
    renderForm();
    expect(screen.getByLabelText(/client name/i)).toHaveAttribute('aria-describedby', 'error-clientName');
  });

  it('clientEmail input references its live region via aria-describedby', () => {
    renderForm();
    expect(screen.getByLabelText(/client email/i)).toHaveAttribute('aria-describedby', 'error-clientEmail');
  });

  it('Add Item button is present', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  it('Submit Invoice button is present', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /submit invoice/i })).toBeInTheDocument();
  });
});

describe('InvoiceForm — validation', () => {
  it('shows client name required error when submitted empty', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await waitFor(() => {
      expect(container.querySelector('#error-clientName')!.textContent).toMatch(/Client name is required\./i);
    });
  });

  it('shows client email required error when submitted empty', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await waitFor(() => {
      expect(container.querySelector('#error-clientEmail')!.textContent).toMatch(/Client email is required\./i);
    });
  });

  it('shows email format error for invalid email', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    await user.type(screen.getByLabelText(/client name/i), 'Acme');
    await user.type(screen.getByLabelText(/client email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await waitFor(() => {
      expect(container.querySelector('#error-clientEmail')!.textContent).toMatch(/valid email address/i);
    });
  });

  it('error live regions are empty before any submission', () => {
    const { container } = renderForm();
    expect(container.querySelector('#error-clientName')!.textContent).toBe('');
    expect(container.querySelector('#error-clientEmail')!.textContent).toBe('');
  });

  it('re-announces errors on double-submit via CLEAR_ERRORS + SET_ERRORS', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await waitFor(() => {
      expect(container.querySelector('#error-clientName')!.textContent).toMatch(/required/i);
    });
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await waitFor(() => {
      expect(container.querySelector('#error-clientName')!.textContent).toMatch(/required/i);
    });
  });

  it('clears errors when valid form is submitted', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const { container } = renderForm();
    await user.type(screen.getByLabelText(/client name/i), 'Acme Corp');
    await user.type(screen.getByLabelText(/client email/i), 'acme@example.com');
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await waitFor(() => {
      expect(container.querySelector('#error-clientName')!.textContent).toBe('');
      expect(container.querySelector('#error-clientEmail')!.textContent).toBe('');
    });
    vi.restoreAllMocks();
  });
});

describe('InvoiceForm — line items', () => {
  it('renders one line item row by default', () => {
    renderForm();
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(rows).toHaveLength(1);
  });

  it('first row remove button has aria-label "Remove item 1"', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeInTheDocument();
  });

  it('first row description input has label "Description (item 1)"', () => {
    renderForm();
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(within(rows[0]).getByLabelText('Description (item 1)')).toBeInTheDocument();
  });

  it('first row quantity input has label "Quantity (item 1)"', () => {
    renderForm();
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(within(rows[0]).getByLabelText('Quantity (item 1)')).toBeInTheDocument();
  });

  it('first row unit price input has label "Unit price (item 1)"', () => {
    renderForm();
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(within(rows[0]).getByLabelText('Unit price (item 1)')).toBeInTheDocument();
  });

  it('first row currency select has label "Currency (item 1)"', () => {
    renderForm();
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(within(rows[0]).getByLabelText('Currency (item 1)')).toBeInTheDocument();
  });

  it('adds a second row when Add Item is clicked', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(rows).toHaveLength(2);
  });

  it('second row has aria-label "Remove item 2" after adding', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    expect(screen.getByRole('button', { name: 'Remove item 2' })).toBeInTheDocument();
  });

  it('uses within() for scoped label queries in multi-row forms', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(within(rows[0]).getByLabelText('Description (item 1)')).toBeInTheDocument();
    expect(within(rows[1]).getByLabelText('Description (item 2)')).toBeInTheDocument();
  });

  it('removes a row when Remove item 1 is clicked', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    await user.click(screen.getByRole('button', { name: 'Remove item 1' }));
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(rows).toHaveLength(1);
  });

  it('returns focus to Add Item button after row removal', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    await user.click(screen.getByRole('button', { name: 'Remove item 1' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add item/i })).toHaveFocus();
    });
  });

  it('line item description input references its ValidationError via aria-describedby', () => {
    renderForm();
    const rows = screen.getAllByRole('group', { name: /line item/i });
    const descInput = within(rows[0]).getByLabelText('Description (item 1)');
    expect(descInput).toHaveAttribute('aria-describedby', 'error-line-0-description');
  });

  it('ValidationError for line-0-description is in the DOM on initial render', () => {
    const { container } = renderForm();
    expect(container.querySelector('#error-line-0-description')).toBeInTheDocument();
  });
});
