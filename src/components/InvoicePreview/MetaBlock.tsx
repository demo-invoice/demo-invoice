import type { InvoiceMeta } from '../../types/invoice';
import { ifPresent } from '../../utils/ifPresent';
import styles from './InvoicePreview.module.css';

interface MetaBlockProps {
  meta: InvoiceMeta;
}

/**
 * Renders the invoice heading, number, issue date, and due date.
 * Positioned in the top-right quadrant of the preview.
 */
export function MetaBlock({ meta }: MetaBlockProps): JSX.Element {
  return (
    <div className={styles.metaBlock}>
      <div className={styles.invoiceHeading}>INVOICE</div>

      {ifPresent(meta.invoiceNumber, (v) => (
        <div className={styles.metaRow}>
          <span className={styles.metaRowLabel}>Invoice #</span>
          <span className={styles.metaRowValue}>{v}</span>
        </div>
      ))}

      {ifPresent(meta.issueDate, (v) => (
        <div className={styles.metaRow}>
          <span className={styles.metaRowLabel}>Issue date</span>
          <span className={styles.metaRowValue}>{v}</span>
        </div>
      ))}

      {ifPresent(meta.dueDate, (v) => (
        <div className={styles.metaRow}>
          <span className={styles.metaRowLabel}>Due date</span>
          <span className={styles.metaRowValue}>{v}</span>
        </div>
      ))}
    </div>
  );
}
