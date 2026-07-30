import React, { useRef } from 'react';
import { useInvoice } from '../context/InvoiceContext';

/**
 * Form panel for editing all invoice fields.
 * Dispatches typed actions to InvoiceContext reducer.
 * Hidden during @media print via .form-panel CSS class.
 */
export function FormPanel() {
  const { state, dispatch } = useInvoice();
  const { sender, client, lineItems, taxRate, notes, invoiceNumber, issueDate, dueDate } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        // Use file.type; may be empty string for SVG — img src handles it fine.
        dispatch({ type: 'SET_LOGO', dataUrl, mime: file.type });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="form-panel">
      <h2 className="form-panel__heading">Invoice Details</h2>

      {/* Invoice meta */}
      <fieldset className="form-panel__fieldset">
        <legend>Invoice Info</legend>
        <label>
          Invoice Number
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: e.target.value })}
            placeholder="INV-001"
          />
        </label>
        <label>
          Issue Date
          <input
            type="date"
            value={issueDate}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'issueDate', value: e.target.value })}
          />
        </label>
        <label>
          Due Date
          <input
            type="date"
            value={dueDate}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'dueDate', value: e.target.value })}
          />
        </label>
      </fieldset>

      {/* Sender */}
      <fieldset className="form-panel__fieldset">
        <legend>From (Sender)</legend>
        <label>Name
          <input type="text" value={sender.name}
            onChange={(e) => dispatch({ type: 'UPDATE_SENDER', field: 'name', value: e.target.value })} />
        </label>
        <label>Email
          <input type="email" value={sender.email}
            onChange={(e) => dispatch({ type: 'UPDATE_SENDER', field: 'email', value: e.target.value })} />
        </label>
        <label>Address
          <textarea value={sender.address} rows={3}
            onChange={(e) => dispatch({ type: 'UPDATE_SENDER', field: 'address', value: e.target.value })} />
        </label>
      </fieldset>

      {/* Client */}
      <fieldset className="form-panel__fieldset">
        <legend>Bill To (Client)</legend>
        <label>Name
          <input type="text" value={client.name}
            onChange={(e) => dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: e.target.value })} />
        </label>
        <label>Email
          <input type="email" value={client.email}
            onChange={(e) => dispatch({ type: 'UPDATE_CLIENT', field: 'email', value: e.target.value })} />
        </label>
        <label>Address
          <textarea value={client.address} rows={3}
            onChange={(e) => dispatch({ type: 'UPDATE_CLIENT', field: 'address', value: e.target.value })} />
        </label>
      </fieldset>

      {/* Line items */}
      <fieldset className="form-panel__fieldset">
        <legend>Line Items</legend>
        {lineItems.map((item, idx) => (
          <div key={item.id} className="form-panel__line-item">
            <span className="form-panel__line-item-index">#{idx + 1}</span>
            <label>Description
              <input type="text" value={item.description}
                onChange={(e) => dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field: 'description', value: e.target.value })} />
            </label>
            <label>Qty
              <input type="number" min={0} value={item.quantity}
                onChange={(e) => dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field: 'quantity', value: Number(e.target.value) })} />
            </label>
            <label>Unit Price
              <input type="number" min={0} step="0.01" value={item.unitPrice}
                onChange={(e) => dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field: 'unitPrice', value: Number(e.target.value) })} />
            </label>
            <button
              type="button"
              onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', id: item.id })}
              aria-label={`Remove line item ${idx + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}>
          + Add Line Item
        </button>
      </fieldset>

      {/* Tax */}
      <fieldset className="form-panel__fieldset">
        <legend>Tax</legend>
        <label>Tax Rate (%)
          <input type="number" min={0} max={100} step="0.1" value={taxRate}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'taxRate', value: Number(e.target.value) })} />
        </label>
      </fieldset>

      {/* Notes */}
      <fieldset className="form-panel__fieldset">
        <legend>Notes</legend>
        <label>Notes
          <textarea value={notes} rows={4}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'notes', value: e.target.value })} />
        </label>
      </fieldset>

      {/* Logo */}
      <fieldset className="form-panel__fieldset">
        <legend>Logo</legend>
        <label>Upload Logo (PNG, JPG, SVG)
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.svg"
            onChange={handleLogoUpload}
          />
        </label>
        {state.logo && (
          <button type="button" onClick={() => dispatch({ type: 'SET_LOGO', dataUrl: '', mime: '' })}>
            Remove Logo
          </button>
        )}
      </fieldset>

      {/* Reset */}
      <button
        type="button"
        className="form-panel__reset"
        onClick={() => dispatch({ type: 'RESET' })}
      >
        Reset Invoice
      </button>
    </div>
  );
}
