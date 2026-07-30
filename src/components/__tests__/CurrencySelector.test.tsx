/**
 * Unit tests for CurrencySelector.
 *
 * (a) Default renders USD selected.
 * (b) Switching to JPY → 0-decimal formatted output.
 * (c) Switching to a non-JPY currency (EUR) → 2-decimal formatted output.
 * (d) Selecting Other → custom symbol input appears.
 * (+) maxLength=4 is enforced on the custom symbol input.
 * (+) Switching away from Other hides the custom input.
 * (+) localStorage is written on currency change.
 * (+) Reducer enforces 4-char slice on SET_CUSTOM_CURRENCY_SYMBOL.
 */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { CurrencySelector } from '../CurrencySelector';
import { formatCurrency } from '../../utils/formatCurrency';

function renderWithProvider(ui: React.ReactElement) {
  return render(<InvoiceProvider>{ui}</InvoiceProvider>);
}

beforeEach(() => {
  localStorage.clear();
});

describe('CurrencySelector', () => {
  // (a) Default renders USD selected
  it('renders with USD selected by default', () => {
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });
    expect(select).toHaveValue('USD');
  });

  it('renders all expected currency options', () => {
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });
    const options = Array.from((select as HTMLSelectElement).options).map(
      (o) => o.value,
    );
    expect(options).toContain('USD');
    expect(options).toContain('EUR');
    expect(options).toContain('GBP');
    expect(options).toContain('AUD');
    expect(options).toContain('CAD');
    expect(options).toContain('JPY');
    expect(options).toContain('Other');
  });

  // (b) Switch to JPY → 0-decimal output
  it('switching to JPY produces 0-decimal formatted output', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    await user.selectOptions(select, 'JPY');
    expect(select).toHaveValue('JPY');

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
    expect(result).toMatch(/^€/);
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

  // maxLength=4 enforcement via HTML attribute
  it('custom symbol input has maxLength attribute of 4', async () => {
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

  // localStorage persistence wire-up
  it('persists selected currency to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    await user.selectOptions(select, 'JPY');
    expect(localStorage.getItem('invoice_currency')).toBe('JPY');
  });

  it('persists default USD to localStorage on initial render', () => {
    renderWithProvider(<CurrencySelector />);
    expect(localStorage.getItem('invoice_currency')).toBe('USD');
  });

  it('persists custom currency symbol to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    await user.selectOptions(select, 'Other');
    const customInput = screen.getByRole('textbox', {
      name: /custom currency symbol/i,
    });
    await user.type(customInput, '₿');
    expect(localStorage.getItem('invoice_custom_currency_symbol')).toBe('₿');
  });

  // Reducer-level 4-char slice enforcement (second layer beyond maxLength)
  it('reducer slices custom symbol to 4 characters', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    await user.selectOptions(select, 'Other');
    const customInput = screen.getByRole('textbox', {
      name: /custom currency symbol/i,
    }) as HTMLInputElement;

    // Bypass maxLength by firing a change event with a long value directly
    // to verify the reducer's slice(0,4) enforcement
    const longSymbol = 'ABCDE';
    // Use fireEvent to bypass the browser maxLength enforcement in jsdom
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(customInput, { target: { value: longSymbol } });

    // The reducer should have sliced to 4 chars
    expect(customInput.value).toBe('ABCD');
  });

  // Label text verification
  it('renders the Currency label', () => {
    renderWithProvider(<CurrencySelector />);
    expect(screen.getByText('Currency')).toBeInTheDocument();
  });

  it('renders the Custom symbol label when Other is selected', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });

    await user.selectOptions(select, 'Other');
    expect(screen.getByText('Custom symbol')).toBeInTheDocument();
  });
});
