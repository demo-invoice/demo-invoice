import React from 'react';
import { useInvoice, useInvoiceDispatch } from '../../context/InvoiceContext';

/** Form section for client (bill-to) details. */
export function ClientDetails(): React.JSX.Element {
  const { state } = useInvoice();
  const dispatch = useInvoiceDispatch();

  return (
    <fieldset className="form-section">
      <legend>Client Details</legend>

      <label htmlFor="clientName">Name / Company</label>
      <input
        id="clientName"
        type="text"
        value={state.clientName}
        onChange={e => dispatch({ type: 'SET_CLIENT_NAME', payload: e.target.value })}
      />

      <label htmlFor="clientEmail">Email</label>
      <input
        id="clientEmail"
        type="email"
        value={state.clientEmail}
        onChange={e => dispatch({ type: 'SET_CLIENT_EMAIL', payload: e.target.value })}
      />

      <label htmlFor="clientAddress">Address</label>
      <textarea
        id="clientAddress"
        rows={3}
        value={state.clientAddress}
        onChange={e => dispatch({ type: 'SET_CLIENT_ADDRESS', payload: e.target.value })}
      />
    </fieldset>
  );
}
