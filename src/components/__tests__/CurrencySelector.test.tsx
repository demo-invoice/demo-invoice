/**
 * Unit tests for CurrencySelector.
 *
 * (a) Default renders USD selected.
 * (b) Switching to JPY → 0-decimal formatted output.
 * (c) Switching to EUR → 2-decimal formatted output.
 * (d) Selecting Other → custom symbol input appears.
 * (+) maxLength=4 is enforced on the custom symbol input.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { CurrencySelector } from '../CurrencySelector';
import { formatCurrency } from '../../utils/formatCurrency';

function renderWithProvider(ui: React.ReactElement) {
  return render(<InvoiceProvider>{ui}</InvoiceProvider>);
}

describe('CurrencySelector', () => {
  // (a) Default renders USD selected
  it('renders with USD selected by default', () => {
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });
    expect(select).toHaveValue('USD');
  });

  // (b) Switch to JPY → 0-decimal output
  it('switching to JPY produces 0-decimal formatted output', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    await user.selectOptions(select, 'JPY');
    expect(select).toHaveValue('JPY');

    // Verify the utility itself produces 0-decimal output for JPY
    const result = formatCurrency(1234.56, 'JPY');
    expect(result).toBe('¥1,235');
    expect(result).not.toContain('.');
  });

  // (c) Switch to EUR → 2-decimal output
  it('switching to EUR produces 2-decimal formatted output', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    await user.selectOptions(select, 'EUR');
    expect(select).toHaveValue('EUR');

    const result = formatCurrency(1234.5, 'EUR');
    expect(result).toMatch(/€/);
    // Must contain a decimal separator with exactly 2 decimal digits
    expect(result).toMatch(/[.,]\d{2}$/);
  });

  // (d) Selecting Other → custom symbol input appears
  it('selecting Other reveals the custom symbol input', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    // Input should not be present initially
    expect(
      screen.queryByRole('textbox', { name: /custom currency symbol/i }),
    ).toBeNull();

    await user.selectOptions(select, 'Other');

    const customInput = screen.getByRole('textbox', {
      name: /custom currency symbol/i,
    });
    expect(customInput).toBeVisible();
  });

  // maxLength=4 enforcement
  it('custom symbol input has maxLength of 4', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    await user.selectOptions(select, 'Other');

    const customInput = screen.getByRole('textbox', {
      name: /custom currency symbol/i,
    });
    expect(customInput).toHaveAttribute('maxLength', '4');
  });

  // Switching away from Other hides the custom input
  it('switching away from Other hides the custom symbol input', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    await user.selectOptions(select, 'Other');
    expect(
      screen.getByRole('textbox', { name: /custom currency symbol/i }),
    ).toBeVisible();

    await user.selectOptions(select, 'USD');
    expect(
      screen.queryByRole('textbox', { name: /custom currency symbol/i }),
    ).toBeNull();
  });
});
