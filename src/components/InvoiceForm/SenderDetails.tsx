import React from 'react';
import { useInvoice, useInvoiceDispatch } from '../../context/InvoiceContext';

/** Form section for sender (your) details. */
export function SenderDetails(): React.JSX.Element {
  const { state } = useInvoice();
  const dispatch = useInvoiceDispatch();

  return (
    <fieldset className="form-section">
      <legend>Your Details</legend>

      <label htmlFor="senderName">Name / Company</label>
      <input
        id="senderName"
        type="text"
        value={state.senderName}
        onChange={e => dispatch({ type: 'SET_SENDER_NAME', payload: e.target.value })}
      />

      <label htmlFor="senderEmail">Email</label>
      <input
        id="senderEmail"
        type="email"
        value={state.senderEmail}
        onChange={e => dispatch({ type: 'SET_SENDER_EMAIL', payload: e.target.value })}
      />

      <label htmlFor="senderAddress">Address</label>
      <textarea
        id="senderAddress"
        rows={3}
        value={state.senderAddress}
        onChange={e => dispatch({ type: 'SET_SENDER_ADDRESS', payload: e.target.value })}
      />
    </fieldset>
  );
}
