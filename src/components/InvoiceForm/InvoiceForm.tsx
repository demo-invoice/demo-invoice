import React from 'react';
import { tokens } from '../../tokens';
import { useInvoiceDispatch, useInvoiceState } from '../../context/InvoiceContext';
import type { InvoiceState, LineItem } from '../../types/invoice';

type ScalarField = keyof Omit<InvoiceState, 'lineItems'>;

/** Shared input style derived from tokens. */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: `${tokens.spacing['2']} ${tokens.spacing['3']}`,
  fontSize: tokens.typography.size.base,
  fontFamily: tokens.typography.fontFamily,
  border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radii.sm,
  color: tokens.color.text,
  backgroundColor: tokens.color.surface,
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: tokens.typography.size.sm,
  fontWeight: tokens.typography.weight.medium,
  color: tokens.color.textMuted,
  marginBottom: tokens.spacing['1'],
};

const fieldStyle: React.CSSProperties = {
  marginBottom: tokens.spacing['3'],
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: tokens.typography.size.sm,
  fontWeight: tokens.typography.weight.bold,
  color: tokens.color.accent,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: `${tokens.spacing['5']} 0 ${tokens.spacing['3']}`,
};

/** Labelled text input helper. */
function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}): React.JSX.Element {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Line item row editor. */
function LineItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: LineItem;
  onUpdate: (field: keyof Omit<LineItem, 'id'>, value: string) => void;
  onRemove: () => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 100px 32px',
        gap: tokens.spacing['2'],
        marginBottom: tokens.spacing['2'],
        alignItems: 'center',
      }}
    >
      <input
        style={inputStyle}
        placeholder="Description"
        value={item.description}
        onChange={(e) => onUpdate('description', e.target.value)}
      />
      <input
        style={{ ...inputStyle, textAlign: 'right' }}
        placeholder="Qty"
        value={item.quantity}
        onChange={(e) => onUpdate('quantity', e.target.value)}
      />
      <input
        style={{ ...inputStyle, textAlign: 'right' }}
        placeholder="Unit Price"
        value={item.unitPrice}
        onChange={(e) => onUpdate('unitPrice', e.target.value)}
      />
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: tokens.color.textMuted,
          fontSize: tokens.typography.size.md,
          lineHeight: 1,
          padding: 0,
        }}
        aria-label="Remove line item"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Minimal controlled form that dispatches to shared context on every onChange.
 * Provides live-update wiring so the preview mirrors the form in real time.
 */
export function InvoiceForm(): React.JSX.Element {
  const state = useInvoiceState();
  const dispatch = useInvoiceDispatch();

  const field = (f: ScalarField) => (v: string) =>
    dispatch({ type: 'UPDATE_FIELD', field: f, value: v });

  return (
    <div
      style={{
        padding: tokens.spacing['6'],
        overflowY: 'auto',
        height: '100%',
        boxSizing: 'border-box',
        fontFamily: tokens.typography.fontFamily,
      }}
    >
      <h2
        style={{
          fontSize: tokens.typography.size.lg,
          fontWeight: tokens.typography.weight.bold,
          color: tokens.color.text,
          marginTop: 0,
          marginBottom: tokens.spacing['5'],
        }}
      >
        Invoice Details
      </h2>

      <p style={sectionHeadingStyle}>Invoice Info</p>
      <Field label="Invoice Number" value={state.invoiceNumber} onChange={field('invoiceNumber')} placeholder="INV-001" />
      <Field label="Issue Date" value={state.issueDate} onChange={field('issueDate')} type="date" />
      <Field label="Due Date" value={state.dueDate} onChange={field('dueDate')} type="date" />

      <p style={sectionHeadingStyle}>From</p>
      <Field label="Your Name / Company" value={state.senderName} onChange={field('senderName')} />
      <Field label="Email" value={state.senderEmail} onChange={field('senderEmail')} type="email" />
      <Field label="Phone (optional)" value={state.senderPhone} onChange={field('senderPhone')} />
      <Field label="Address Line 1" value={state.senderAddress1} onChange={field('senderAddress1')} />
      <Field label="Address Line 2 (optional)" value={state.senderAddress2} onChange={field('senderAddress2')} />

      <p style={sectionHeadingStyle}>Bill To</p>
      <Field label="Client Name" value={state.billToName} onChange={field('billToName')} />
      <Field label="Client Email (optional)" value={state.billToEmail} onChange={field('billToEmail')} type="email" />
      <Field label="Client Phone (optional)" value={state.billToPhone} onChange={field('billToPhone')} />
      <Field label="Address Line 1" value={state.billToAddress1} onChange={field('billToAddress1')} />
      <Field label="Address Line 2 (optional)" value={state.billToAddress2} onChange={field('billToAddress2')} />

      <p style={sectionHeadingStyle}>Line Items</p>
      {state.lineItems.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 100px 32px',
            gap: tokens.spacing['2'],
            marginBottom: tokens.spacing['1'],
          }}
        >
          {['Description', 'Qty', 'Unit Price', ''].map((h) => (
            <span
              key={h}
              style={{
                fontSize: tokens.typography.size.xs,
                fontWeight: tokens.typography.weight.semibold,
                color: tokens.color.textMuted,
                textTransform: 'uppercase',
              }}
            >
              {h}
            </span>
          ))}
        </div>
      )}
      {state.lineItems.map((item) => (
        <LineItemRow
          key={item.id}
          item={item}
          onUpdate={(f, v) => dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field: f, value: v })}
          onRemove={() => dispatch({ type: 'REMOVE_LINE_ITEM', id: item.id })}
        />
      ))}
      <button
        onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
        style={{
          marginTop: tokens.spacing['2'],
          padding: `${tokens.spacing['2']} ${tokens.spacing['4']}`,
          backgroundColor: tokens.color.accent,
          color: '#fff',
          border: 'none',
          borderRadius: tokens.radii.sm,
          fontSize: tokens.typography.size.base,
          fontFamily: tokens.typography.fontFamily,
          cursor: 'pointer',
          fontWeight: tokens.typography.weight.medium,
        }}
      >
        + Add Line Item
      </button>

      <p style={sectionHeadingStyle}>Tax &amp; Notes</p>
      <Field label="Tax Rate (%)" value={state.taxRate} onChange={field('taxRate')} placeholder="0" />
      <div style={fieldStyle}>
        <label style={labelStyle}>Notes (optional)</label>
        <textarea
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          value={state.notes}
          placeholder="Payment terms, thank-you note…"
          onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'notes', value: e.target.value })}
        />
      </div>
    </div>
  );
}
