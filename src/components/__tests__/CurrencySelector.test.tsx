import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { CurrencySelector } from '../CurrencySelector';
import { InvoiceForm } from '../InvoiceForm';

function renderWithProvider(ui: React.ReactElement) {
  return render(<InvoiceProvider>{ui}</InvoiceProvider>);
}

describe('CurrencySelector', () => {
  it('(a) renders with USD selected by default', () => {
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });
    expect(select).toHaveValue('USD');
  });

  it('(b) switching to JPY produces 0-decimal formatted output', () => {
    renderWithProvider(<InvoiceForm />);
    const select = screen.getByRole('combobox', { name: /currency/i });
    fireEvent.change(select, { target: { value: 'JPY' } });
    const total = screen.getByTestId('total');
    expect(total.textContent).toMatch(/^¥[\d,]+$/);
  });

  it('(c) switching to EUR produces 2-decimal formatted output', () => {
    renderWithProvider(<InvoiceForm />);
    const select = screen.getByRole('combobox', { name: /currency/i });
    fireEvent.change(select, { target: { value: 'EUR' } });
    const total = screen.getByTestId('total');
    expect(total.textContent).toMatch(/€[\d,]+\.\d{2}$/);
  });

  it('(d) selecting Other reveals the custom symbol input', () => {
    renderWithProvider(<CurrencySelector />);
    const select = screen.getByRole('combobox', { name: /currency/i });
    fireEvent.change(select, { target: { value: 'Other' } });
    const customInput = screen.getByRole('textbox', { name: /custom currency symbol/i });
    expect(customInput).toBeInTheDocument();
    expect(customInput).toHaveAttribute('maxLength', '4');
  });
});
