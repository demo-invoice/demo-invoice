// globals: true — describe/it/expect/vi are injected by vitest; do NOT import them
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyDropdown, CURRENCIES } from '../components/InvoiceForm/CurrencyDropdown';

function setup(value = 'USD', onChange = vi.fn()) {
  const user = userEvent.setup();
  const utils = render(<CurrencyDropdown value={value} onChange={onChange} />);
  return { user, onChange, ...utils };
}

describe('CurrencyDropdown', () => {
  it('exports CURRENCIES constant with at least 3 entries', () => {
    expect(CURRENCIES.length).toBeGreaterThanOrEqual(3);
    expect(CURRENCIES[0]).toHaveProperty('value');
    expect(CURRENCIES[0]).toHaveProperty('label');
  });

  it('renders the selected currency label', () => {
    setup('EUR');
    expect(screen.getByRole('combobox')).toHaveTextContent('EUR');
  });

  it('has aria-expanded=false when closed', () => {
    setup();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens listbox on click and sets aria-expanded=true', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('renders all currency options when open', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(CURRENCIES.length);
  });

  it('calls onChange with selected value when option is clicked', async () => {
    const { user, onChange } = setup('USD');
    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');
    await user.click(options[1]); // EUR
    expect(onChange).toHaveBeenCalledWith(CURRENCIES[1].value);
  });

  it('closes listbox after selecting an option', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');
    await user.click(options[0]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens with Enter key', async () => {
    const { user } = setup();
    screen.getByRole('combobox').focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens with Space key', async () => {
    const { user } = setup();
    screen.getByRole('combobox').focus();
    await user.keyboard(' ');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes listbox with Escape key', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates options with ArrowDown', async () => {
    const { user } = setup('USD');
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}'); // opens
    await user.keyboard('{ArrowDown}'); // moves to index 1
    const combobox = screen.getByRole('combobox');
    const activeId = combobox.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    const activeEl = document.getElementById(activeId!);
    expect(activeEl).toHaveTextContent(CURRENCIES[1].label);
  });

  it('navigates options with ArrowUp', async () => {
    const { user } = setup('USD');
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}'); // opens at index 0
    await user.keyboard('{ArrowDown}'); // index 1
    await user.keyboard('{ArrowUp}');  // back to index 0
    const combobox = screen.getByRole('combobox');
    const activeId = combobox.getAttribute('aria-activedescendant');
    const activeEl = document.getElementById(activeId!);
    expect(activeEl).toHaveTextContent(CURRENCIES[0].label);
  });

  it('selects highlighted option with Enter when open', async () => {
    const { user, onChange } = setup('USD');
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}'); // opens
    await user.keyboard('{ArrowDown}'); // moves to index 1
    await user.keyboard('{Enter}');     // selects
    expect(onChange).toHaveBeenCalledWith(CURRENCIES[1].value);
  });

  it('closes without trapping on Tab key', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Tab}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks the selected option as aria-selected=true', async () => {
    const { user } = setup('GBP');
    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');
    const gbpOption = options.find((o) => o.textContent?.includes('GBP'));
    expect(gbpOption).toHaveAttribute('aria-selected', 'true');
  });
});
