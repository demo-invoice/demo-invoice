import { useInvoice } from '../../context/InvoiceContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

export interface CurrencyDropdownProps {
  id: string;
  value: string;
  lineItemId: string;
}

/**
 * Accessible currency selector. Native <select> provides full keyboard
 * navigation (Tab to focus, arrow keys to change, Enter/Space to confirm)
 * without any custom ARIA widget.
 */
export function CurrencyDropdown({ id, value, lineItemId }: CurrencyDropdownProps) {
  const { dispatch } = useInvoice();
  return (
    <select
      id={id}
      value={value}
      onChange={(e) =>
        dispatch({
          type: 'UPDATE_LINE_ITEM',
          id: lineItemId,
          field: 'currency',
          value: e.target.value,
        })
      }
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
