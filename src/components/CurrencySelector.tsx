/**
 * CurrencySelector — controlled dropdown for choosing the invoice currency.
 *
 * When 'Other' is selected, reveals a text input (maxLength=4) for a custom
 * symbol. Dispatches SET_CURRENCY and SET_CUSTOM_CURRENCY_SYMBOL actions to
 * InvoiceContext.
 */
import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { CURRENCY_OPTIONS } from '../utils/formatCurrency';

/** Renders the currency selector and (conditionally) the custom symbol input. */
export function CurrencySelector() {
  const { state, dispatch } = useInvoice();

  function handleCurrencyChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void {
    dispatch({ type: 'SET_CURRENCY', payload: event.target.value });
  }

  function handleCustomSymbolChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    dispatch({
      type: 'SET_CUSTOM_CURRENCY_SYMBOL',
      payload: event.target.value,
    });
  }

  return (
    <div className="currency-selector">
      <label htmlFor="currency-select">Currency</label>
      <select
        id="currency-select"
        value={state.currency}
        onChange={handleCurrencyChange}
        aria-label="Currency"
      >
        {CURRENCY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {state.currency === 'Other' && (
        <div className="custom-symbol-wrapper">
          <label htmlFor="custom-symbol-input">Custom symbol</label>
          <input
            id="custom-symbol-input"
            type="text"
            maxLength={4}
            value={state.customCurrencySymbol}
            onChange={handleCustomSymbolChange}
            placeholder="e.g. ₿"
            aria-label="Custom currency symbol"
          />
        </div>
      )}
    </div>
  );
}
