import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyDropdown, CURRENCIES } from './CurrencyDropdown';

describe('CurrencyDropdown', () => {
  it('renders with the selected value displayed', () => {
    render(<CurrencyDropdown value="USD" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('has aria-haspopup="listbox"', () => {
    render(<CurrencyDropdown value="USD" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('has aria-expanded="false" when closed', () => {
    render(<CurrencyDropdown value="USD" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the listbox on Enter key', () => {
    render(<CurrencyDropdown value="USD" onChange={() => {}} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens the listbox on Space key', () => {
    render(<CurrencyDropdown value="USD" onChange={() => {}} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: ' ' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes the listbox on Escape key', () => {
    render(<CurrencyDropdown value="USD" onChange={() => {}} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(combobox, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders options with role="option"', () => {
    render(<CurrencyDropdown value="USD" onChange={() => {}} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'Enter' });
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(CURRENCIES.length);
  });

  it('calls onChange with the selected currency code string', () => {
    const handleChange = vi.fn();
    render(<CurrencyDropdown value="USD" onChange={handleChange} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'Enter' });
    const options = screen.getAllByRole('option');
    fireEvent.click(options[1]);
    expect(handleChange).toHaveBeenCalledWith(CURRENCIES[1].value);
  });

  it('navigates options with ArrowDown', () => {
    render(<CurrencyDropdown value="USD" onChange={() => {}} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'Enter' });
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates options with ArrowUp', () => {
    render(<CurrencyDropdown value="EUR" onChange={() => {}} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'Enter' });
    fireEvent.keyDown(combobox, { key: 'ArrowUp' });
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('has aria-activedescendant pointing to the active option', () => {
    render(<CurrencyDropdown value="USD" onChange={() => {}} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'Enter' });
    const activeDescendant = combobox.getAttribute('aria-activedescendant');
    expect(activeDescendant).toBeTruthy();
    const activeOption = document.getElementById(activeDescendant!);
    expect(activeOption).not.toBeNull();
  });

  it('CURRENCIES is an array of objects with value and label', () => {
    expect(Array.isArray(CURRENCIES)).toBe(true);
    CURRENCIES.forEach((c) => {
      expect(typeof c.value).toBe('string');
      expect(typeof c.label).toBe('string');
    });
  });

  it('calls onChange with a string (currency code)', () => {
    const handleChange = vi.fn();
    render(<CurrencyDropdown value="USD" onChange={handleChange} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'Enter' });
    const options = screen.getAllByRole('option');
    fireEvent.click(options[2]);
    // Must be called with a plain string, not an object
    expect(handleChange).toHaveBeenCalledWith(CURRENCIES[2].value);
    expect(typeof handleChange.mock.calls[0][0]).toBe('string');
  });
});
