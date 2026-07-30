import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { InvoiceForm } from './InvoiceForm';

/** Renders InvoiceForm wrapped in InvoiceProvider. */
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

  it('every input has an associated label', () => {
    renderForm();
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client email/i)).toBeInTheDocument();
  });

  it('ValidationError containers are in the DOM before submission', () => {
    renderForm();
    expect(document.getElementById('error-clientName')).toBeInTheDocument();
    expect(document.getElementById('error-clientEmail')).toBeInTheDocument();
  });

  it('inputs reference their ValidationError via aria-describedby', () => {
    renderForm();
    const nameInput = screen.getByLabelText(/client name/i);
    const emailInput = screen.getByLabelText(/client email/i);
    expect(nameInput).toHaveAttribute('aria-describedby', 'error-clientName');
    expect(emailInput).toHaveAttribute('aria-describedby', 'error-clientEmail');
  });
});

describe('InvoiceForm — validation', () => {
  it('shows errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    expect(await screen.findByText(/client name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/client email is required/i)).toBeInTheDocument();
  });

  it('shows email format error for invalid email', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/client name/i), 'Acme');
    await user.type(screen.getByLabelText(/client email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
  });

  it('re-announces errors on double-submit (CLEAR_ERRORS + SET_ERRORS)', async () => {
    const user = userEvent.setup();
    renderForm();
    // First submit — errors appear
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    const errorEl = document.getElementById('error-clientName')!;
    expect(errorEl.textContent).toMatch(/required/i);

    // Second submit — CLEAR_ERRORS empties the node, then SET_ERRORS re-fills it
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await waitFor(() => {
      expect(document.getElementById('error-clientName')!.textContent).toMatch(/required/i);
    });
  });

  it('clears errors when form is valid and submitted', async () => {
    const user = userEvent.setup();
    // Suppress alert
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    renderForm();
    await user.type(screen.getByLabelText(/client name/i), 'Acme Corp');
    await user.type(screen.getByLabelText(/client email/i), 'acme@example.com');
    await user.click(screen.getByRole('button', { name: /submit invoice/i }));
    await waitFor(() => {
      expect(document.getElementById('error-clientName')!.textContent).toBe('');
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

  it('adds a second row when Add Item is clicked', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(rows).toHaveLength(2);
  });

  it('uses within() for scoped label queries in multi-row forms', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    const rows = screen.getAllByRole('group', { name: /line item/i });
    // Each row has its own Description input — scoped query avoids ambiguity
    expect(within(rows[0]).getByLabelText(/description \(item 1\)/i)).toBeInTheDocument();
    expect(within(rows[1]).getByLabelText(/description \(item 2\)/i)).toBeInTheDocument();
  });

  it('remove button has dynamic aria-label', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    expect(screen.getByRole('button', { name: /remove item 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove item 2/i })).toBeInTheDocument();
  });

  it('removes a row when Remove is clicked', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    await user.click(screen.getByRole('button', { name: /remove item 1/i }));
    const rows = screen.getAllByRole('group', { name: /line item/i });
    expect(rows).toHaveLength(1);
  });

  it('returns focus to Add Item button after row removal', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /add item/i }));
    await user.click(screen.getByRole('button', { name: /remove item 1/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add item/i })).toHaveFocus();
    });
  });
});
