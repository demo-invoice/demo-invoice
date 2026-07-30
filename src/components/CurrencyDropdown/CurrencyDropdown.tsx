import { useInvoice } from '../../context/InvoiceContext';

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
  { code: 'JPY', label: 'JPY — Japanese Yen' },
];

/**
 * Native <select> currency dropdown.
 * Uses a native select for full keyboard support (Tab, arrow keys, Enter/Space)
 * without requiring custom ARIA combobox patterns.
 */
export function CurrencyDropdown() {
  const { state, dispatch } = useInvoice();

  return (
    <div className="field-group">
      <label htmlFor="currency">Currency</label>
      <select
        id="currency"
        value={state.currency}
        onChange={(e) =>
          dispatch({ type: 'SET_FIELD', field: 'currency', value: e.target.value })
        }
      >
        {CURRENCIES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
