/**
 * formatCurrency — pure utility for monetary display.
 *
 * Rules:
 *  - JPY → 0 decimal places, ¥ prefix
 *  - Other (custom) → 2 decimal places, customSymbol prefix (empty string if not provided)
 *  - All other ISO codes → 2 decimal places, symbol from CURRENCY_MAP
 *
 * Intl.NumberFormat is intentionally called WITHOUT a `currency` option to
 * prevent the browser from injecting its own symbol, which would cause
 * double-symbol output. The symbol is always manually prefixed.
 */

/** Maps ISO currency codes to their display symbols. */
export const CURRENCY_MAP: Readonly<Record<string, string>> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  JPY: '¥',
};

/** Ordered list of options for the currency <select>. */
export const CURRENCY_OPTIONS: ReadonlyArray<{ value: string; label: string }> =
  [
    { value: 'USD', label: 'USD — US Dollar ($)' },
    { value: 'EUR', label: 'EUR — Euro (€)' },
    { value: 'GBP', label: 'GBP — British Pound (£)' },
    { value: 'AUD', label: 'AUD — Australian Dollar (A$)' },
    { value: 'CAD', label: 'CAD — Canadian Dollar (C$)' },
    { value: 'JPY', label: 'JPY — Japanese Yen (¥)' },
    { value: 'Other', label: 'Other (custom symbol)' },
  ];

/**
 * Formats a numeric monetary value for display.
 *
 * @param value        - The numeric amount to format.
 * @param currency     - ISO currency code or 'Other'.
 * @param customSymbol - Symbol to use when currency === 'Other' (max 4 chars).
 * @returns            Formatted string with symbol prefix, e.g. "$1,234.56".
 */
export function formatCurrency(
  value: number,
  currency: string,
  customSymbol?: string,
): string {
  if (currency === 'JPY') {
    const formatted = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
    return `¥${formatted}`;
  }

  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  if (currency === 'Other') {
    // Gracefully render no prefix when customSymbol is empty.
    const symbol = customSymbol?.slice(0, 4) ?? '';
    return `${symbol}${formatted}`;
  }

  const symbol = CURRENCY_MAP[currency] ?? '';
  return `${symbol}${formatted}`;
}
