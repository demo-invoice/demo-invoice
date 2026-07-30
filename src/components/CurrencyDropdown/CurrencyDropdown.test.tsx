/**
 * Tests for CurrencyDropdown — verifies WAI-ARIA combobox pattern and
 * keyboard navigation contract.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyDropdown } from './CurrencyDropdown';

function renderDropdown(value = 'USD', onChange = vi.fn()) {
  return render(<CurrencyDropdown value={value} onChange={onChange} />);
}

describe('CurrencyDropdown accessibility', () => {
  it('trigger has role=combobox', () => {
    renderDropdown();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('trigger has aria-expanded=false when closed', () => {
    renderDropdown();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens listbox on Enter key', () => {
    renderDropdown();
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens listbox on Space key', () => {
    renderDropdown();
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes listbox on Escape and does not change value', () => {
    const onChange = vi.fn();
    renderDropdown('USD', onChange);
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('selects option on click and calls onChange', () => {
    const onChange = vi.fn();
    renderDropdown('USD', onChange);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'EUR' }));
    expect(onChange).toHaveBeenCalledWith('EUR');
  });

  it('all currency options have stable unique ids', () => {
    renderDropdown();
    fireEvent.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');
    const ids = options.map((o) => o.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^currency-option-/));
  });

  it('ArrowDown navigates to next option', () => {
    renderDropdown('USD');
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    // After one ArrowDown from USD (index 0), active should be EUR (index 1)
    expect(trigger).toHaveAttribute('aria-activedescendant', 'currency-option-EUR');
  });

  it('Enter on listbox selects the active option', () => {
    const onChange = vi.fn();
    renderDropdown('USD', onChange);
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    fireEvent.keyDown(listbox, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('EUR');
  });
});
