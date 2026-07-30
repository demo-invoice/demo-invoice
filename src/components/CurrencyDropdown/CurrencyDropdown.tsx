/**
 * CurrencyDropdown — native <select> implementation for WCAG AA compliance.
 *
 * Using a native <select> gives keyboard navigation for free:
 *   Tab       — move focus to/from the control
 *   Enter/Space — open the dropdown
 *   Arrow keys  — navigate options
 *   Escape      — close without changing selection
 *
 * An explicit <label> is associated via htmlFor/id pairing.
 * Validation errors are linked via aria-describedby.
 */
import styles from './CurrencyDropdown.module.css';
import { ValidationError } from '../ValidationError/ValidationError';

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'JPY', label: 'JPY — Japanese Yen' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
];

interface CurrencyDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/**
 * Accessible currency selector backed by a native <select> element.
 */
export function CurrencyDropdown({ value, onChange, error }: CurrencyDropdownProps) {
  const errorId = 'currency-error';

  return (
    <div className={styles.wrapper}>
      <label htmlFor="currency" className={styles.label}>
        Currency
      </label>
      <select
        id="currency"
        name="currency"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.select}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : undefined}
      >
        {CURRENCIES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
      <ValidationError id={errorId} message={error} />
    </div>
  );
}
