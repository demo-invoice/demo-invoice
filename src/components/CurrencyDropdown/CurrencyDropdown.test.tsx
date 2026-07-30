/**
 * Tests for CurrencyDropdown — verifies WAI-ARIA combobox/listbox pattern,
 * keyboard navigation contract, focus management, and no focus trap.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyDropdown, CURRENCIES } from './CurrencyDropdown';

function renderDropdown(value = 'USD', onChange = vi.fn()) {
  return render(<CurrencyDropdown value={value} onChange={onChange} />);
}

describe('CurrencyDropdown accessibility', () => {
  // ── ARIA roles and attributes ──────────────────────────────────────────────

  it('trigger button has role="combobox"', () => {
    renderDropdown();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('trigger has aria-haspopup="listbox"', () => {
    renderDropdown();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('trigger has aria-expanded="false" when closed', () => {
    renderDropdown();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('trigger has aria-expanded="true" when open', () => {
    renderDropdown();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('trigger has aria-controls pointing to the listbox id', () => {
    renderDropdown();
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    const listbox = screen.getByRole('listbox');
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);
  });

  it('listbox has aria-label="Currency"', () => {
    renderDropdown();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', 'Currency');
  });

  it('each option has role="option"', () => {
    renderDropdown();
    fireEvent.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(CURRENCIES.length);
  });

  it('selected option has aria-selected="true"', () => {
    renderDropdown('EUR');
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'EUR' })).toHaveAttribute('aria-selected', 'true');
  });

  it('non-selected options have aria-selected="false"', () => {
    renderDropdown('USD');
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'EUR' })).toHaveAttribute('aria-selected', 'false');
  });

  it('all option ids are stable, unique, and prefixed with "currency-option-"', () => {
    renderDropdown();
    fireEvent.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');
    const ids = options.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^currency-option-/));
  });

  it('trigger aria-activedescendant is undefined when closed', () => {
    renderDropdown();
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant');
  });

  it('trigger aria-activedescendant points to the active option when open', () => {
    renderDropdown('USD');
    fireEvent.click(screen.getByRole('combobox'));
    // Initial active index is the current value (USD = index 0)
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      'currency-option-USD'
    );
  });

  // ── Keyboard: open ─────────────────────────────────────────────────────────

  it('opens listbox on Enter key', () => {
    renderDropdown();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens listbox on Space key', () => {
    renderDropdown();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: ' ' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('clicking the trigger opens the listbox', () => {
    renderDropdown();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('clicking the trigger again closes the listbox', () => {
    renderDropdown();
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // ── Keyboard: arrow navigation ─────────────────────────────────────────────

  it('ArrowDown moves active option to the next item', () => {
    renderDropdown('USD');
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    // USD is index 0; after one ArrowDown active should be EUR (index 1)
    expect(trigger).toHaveAttribute('aria-activedescendant', 'currency-option-EUR');
  });

  it('ArrowUp moves active option to the previous item', () => {
    renderDropdown('EUR');
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'ArrowUp' });
    // EUR is index 1; after one ArrowUp active should be USD (index 0)
    expect(trigger).toHaveAttribute('aria-activedescendant', 'currency-option-USD');
  });

  it('ArrowDown wraps from last option to first', () => {
    const lastCurrency = CURRENCIES[CURRENCIES.length - 1];
    renderDropdown(lastCurrency);
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    expect(trigger).toHaveAttribute('aria-activedescendant', 'currency-option-USD');
  });

  it('ArrowUp wraps from first option to last', () => {
    const lastCurrency = CURRENCIES[CURRENCIES.length - 1];
    renderDropdown('USD');
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'ArrowUp' });
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      `currency-option-${lastCurrency}`
    );
  });

  // ── Keyboard: select and close ─────────────────────────────────────────────

  it('Enter on listbox selects the active option and calls onChange', () => {
    const onChange = vi.fn();
    renderDropdown('USD', onChange);
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    fireEvent.keyDown(listbox, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('EUR');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clicking an option calls onChange with the correct currency', () => {
    const onChange = vi.fn();
    renderDropdown('USD', onChange);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'GBP' }));
    expect(onChange).toHaveBeenCalledWith('GBP');
  });

  it('clicking an option closes the listbox', () => {
    renderDropdown();
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'EUR' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // ── Keyboard: Escape ───────────────────────────────────────────────────────

  it('Escape closes the listbox without calling onChange', () => {
    const onChange = vi.fn();
    renderDropdown('USD', onChange);
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── No focus trap: Tab closes dropdown ────────────────────────────────────

  it('Tab on the open listbox closes the dropdown (no focus trap)', () => {
    renderDropdown();
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'Tab' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
