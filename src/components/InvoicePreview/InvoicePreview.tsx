import React from 'react';
import {
  useInvoiceStore,
  selectSubtotal,
  selectTaxAmount,
  selectGrandTotal,
  selectLineItemTotal,
} from '../../store/invoiceStore';
import styles from './InvoicePreview.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Formats a number as a localised currency string with exactly 2 decimal places. */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Returns the value if non-empty, otherwise an em-dash placeholder. */
function orDash(value: string | undefined): string {
  return value && value.trim().length > 0 ? value : '\u2014';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * InvoicePreview — pure read-only display component.
 *
 * Reads all invoice data from the Zustand invoiceStore via selectors.
 * Contains zero useState / useReducer / useEffect calls.
 * Contributors must NOT add state mutations inside this component.
 */
export function InvoicePreview(): React.ReactElement {
  const sender = useInvoiceStore((s) => s.sender);
  const client = useInvoiceStore((s) => s.client);
  const meta = useInvoiceStore((s) => s.meta);
  const lineItems = useInvoiceStore((s) => s.lineItems);

  // Derive totals via pure selectors
  const state = useInvoiceStore((s) => s);
  const subtotal = selectSubtotal(state);
  const taxAmount = selectTaxAmount(state);
  const grandTotal = selectGrandTotal(state);

  return (
    <div
      className={styles.previewWrapper}
      aria-live="polite"
      aria-label="Invoice preview"
      role="region"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header: logo + sender (left) | invoice meta (right)                 */}
      {/* ------------------------------------------------------------------ */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {/* Logo placeholder — T10 will replace with a real <img> */}
          <div className={styles.logoPlaceholder} aria-hidden="true" />

          <div className={styles.senderBlock}>
            {sender.companyName && (
              <p className={styles.senderName}>{sender.companyName}</p>
            )}
            {sender.addressLine1 && <p>{sender.addressLine1}</p>}
            {sender.addressLine2 && <p>{sender.addressLine2}</p>}
            {(sender.city || sender.postcode) && (
              <p>
                {[sender.city, sender.postcode].filter(Boolean).join(', ')}
              </p>
            )}
            {sender.country && <p>{sender.country}</p>}
            {sender.phone && <p>{sender.phone}</p>}
            {sender.email && <p>{sender.email}</p>}
          </div>
        </div>

        <div className={styles.metaBlock}>
          <h1 className={styles.invoiceHeading}>INVOICE</h1>
          <p className={styles.invoiceNumber}>
            {orDash(meta.invoiceNumber)}
          </p>
          <dl className={styles.metaDates}>
            <div className={styles.metaRow}>
              <dt>Issue date</dt>
              <dd>{orDash(meta.issueDate)}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Due date</dt>
              <dd>{orDash(meta.dueDate)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bill To                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className={styles.billTo}>
        <h2 className={styles.sectionHeading}>Bill To</h2>
        {client.name && <p className={styles.clientName}>{client.name}</p>}
        {client.addressLine1 && <p>{client.addressLine1}</p>}
        {client.addressLine2 && <p>{client.addressLine2}</p>}
        {(client.city || client.postcode) && (
          <p>{[client.city, client.postcode].filter(Boolean).join(', ')}</p>
        )}
        {client.country && <p>{client.country}</p>}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Line items table                                                     */}
      {/* ------------------------------------------------------------------ */}
      <table className={styles.lineItemsTable}>
        <thead>
          <tr>
            <th className={styles.colDescription}>Description</th>
            <th className={styles.colQty}>Qty</th>
            <th className={styles.colUnitPrice}>Unit Price</th>
            <th className={styles.colTotal}>Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id}>
              <td className={styles.colDescription}>{item.description}</td>
              <td className={styles.colQty}>{item.quantity}</td>
              <td className={styles.colUnitPrice}>
                {formatCurrency(item.unitPrice, meta.currency)}
              </td>
              <td className={styles.colTotal}>
                {formatCurrency(selectLineItemTotal(item), meta.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ------------------------------------------------------------------ */}
      {/* Totals summary                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className={styles.totalsBlock}>
        <dl>
          <div className={styles.totalsRow}>
            <dt>Subtotal</dt>
            <dd>{formatCurrency(subtotal, meta.currency)}</dd>
          </div>
          {/* Tax row always renders — even when taxRate is 0 */}
          <div className={styles.totalsRow}>
            <dt>Tax ({meta.taxRate}%)</dt>
            <dd>{formatCurrency(taxAmount, meta.currency)}</dd>
          </div>
          <div className={`${styles.totalsRow} ${styles.grandTotalRow}`}>
            <dt>Total</dt>
            <dd>{formatCurrency(grandTotal, meta.currency)}</dd>
          </div>
        </dl>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Notes — entire section hidden when empty                            */}
      {/* ------------------------------------------------------------------ */}
      {meta.notes && meta.notes.trim().length > 0 && (
        <section className={styles.notesSection}>
          <h2 className={styles.sectionHeading}>Notes</h2>
          <p>{meta.notes}</p>
        </section>
      )}
    </div>
  );
}
