# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Currency Selector (T9)

The invoice supports multiple currencies via a controlled `<select>` dropdown rendered by `CurrencySelector`. The selected currency and any custom symbol are stored in `InvoiceContext` and used throughout `InvoiceForm` and `InvoicePreview` for live, formatted monetary display.

### Supported currencies

| Code  | Symbol | Decimals |
|-------|--------|----------|
| USD   | $      | 2        |
| EUR   | €      | 2        |
| GBP   | £      | 2        |
| AUD   | A$     | 2        |
| CAD   | C$     | 2        |
| JPY   | ¥      | 0        |
| Other | custom | 2        |

JPY uses `Intl.NumberFormat` with `maximumFractionDigits: 0` — fractional values are rounded by the formatter (e.g. ¥1,234.56 → ¥1,235).

When **Other** is selected, a text input (max 4 characters) appears for a custom symbol. The symbol is prefixed to the formatted number. An empty custom symbol renders no prefix gracefully.

### InvoiceContext action types

```ts
type InvoiceAction =
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_CUSTOM_CURRENCY_SYMBOL'; payload: string };
```

Both action types have explicit `switch` cases in the reducer. The union is exhaustively checked — TypeScript will error on unhandled cases.

### localStorage persistence (T11 wire-up)

The `InvoiceProvider` writes to `localStorage` on every currency state change via a `useEffect`. T11 owns the read/rehydrate side.

| Key                              | Value                                      |
|----------------------------------|--------------------------------------------|
| `invoice_currency`               | Selected currency code (e.g. `"USD"`)      |
| `invoice_custom_currency_symbol` | Custom symbol string (empty string if none)|

### Formatting utility

```ts
import { formatCurrency } from './src/utils/formatCurrency';

formatCurrency(1234.56, 'USD');           // "$1,234.56"
formatCurrency(1234.56, 'JPY');           // "¥1,235"
formatCurrency(1234.56, 'Other', '₿');   // "₿1,234.56"
formatCurrency(0,       'USD');           // "$0.00"
formatCurrency(0,       'JPY');           // "¥0"
```

`Intl.NumberFormat` is called **without** a `currency` option to prevent the browser from injecting its own symbol. The symbol is always manually prefixed.
