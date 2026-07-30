import type { LineItem } from '../../types/invoice';
import { deriveInvoiceTotals, formatCurrency } from '../../utils/invoiceTotals';
import styles from './InvoicePreview.module.css';

interface TotalsBlockProps {
  lineItems: LineItem[];
  taxRate: number;
  currency: string;
}

/**
 * Renders subtotal, optional tax row (suppressed when taxRate === 0),
 * and grand total. Totals are derived via the pure `deriveInvoiceTotals` util.
 */
export function TotalsBlock({
  lineItems,
  taxRate,
  currency,
}: TotalsBlockProps): JSX.Element {
  const { subtotal, taxAmount, grandTotal } = deriveInvoiceTotals(
    lineItems,
    taxRate,
  );

  return (
    <div className={styles.totalsBlock}>
      <div className={styles.totalsRow}>
        <span className={styles.totalsLabel}>Subtotal</span>
        <span className={styles.totalsValue}>
          {formatCurrency(subtotal, currency)}
        </span>
      </div>

      {taxRate > 0 && (
        <div className={styles.totalsRow}>
          <span className={styles.totalsLabel}>Tax ({taxRate}%)</span>
          <span className={styles.totalsValue}>
            {formatCurrency(taxAmount, currency)}
          </span>
        </div>
      )}

      <div className={`${styles.totalsRow} ${styles.grandTotalRow}`}>
        <span className={styles.totalsLabel}>Total</span>
        <span className={styles.totalsValue}>
          {formatCurrency(grandTotal, currency)}
        </span>
      </div>
    </div>
  );
}
