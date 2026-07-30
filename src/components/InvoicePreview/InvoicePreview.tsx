/**
 * InvoicePreview — root read-only preview component.
 *
 * Reads from InvoiceContext via useInvoiceState().
 * Zero mutations: no dispatch, no setState, no side effects.
 */
import { useInvoiceState } from '../../context/InvoiceContext';
import { LogoPlaceholder } from './LogoPlaceholder';
import { SenderBlock } from './SenderBlock';
import { MetaBlock } from './MetaBlock';
import { BillToBlock } from './BillToBlock';
import { LineItemsTable } from './LineItemsTable';
import { TotalsBlock } from './TotalsBlock';
import { NotesBlock } from './NotesBlock';
import styles from './InvoicePreview.module.css';

/**
 * Renders a live, read-only A4-proportioned invoice preview.
 * Re-renders automatically whenever the shared InvoiceContext state changes.
 */
export function InvoicePreview(): JSX.Element {
  const state = useInvoiceState();
  const { sender, client, meta, lineItems, notes, logoUrl } = state;

  return (
    <div className={styles.a4Wrapper} data-testid="invoice-preview">
      <div className={styles.a4Sheet}>
        {/* ── Header: logo + invoice meta ─────────────────────────── */}
        <div className={styles.headerRow}>
          <LogoPlaceholder logoUrl={logoUrl} />
          <MetaBlock meta={meta} />
        </div>

        <hr className={styles.divider} />

        {/* ── Sender + Bill To ────────────────────────────────────── */}
        <div className={styles.addressRow}>
          <SenderBlock sender={sender} />
          <BillToBlock client={client} />
        </div>

        <hr className={styles.divider} />

        {/* ── Line items ──────────────────────────────────────────── */}
        <LineItemsTable lineItems={lineItems} currency={meta.currency} />

        {/* ── Totals ──────────────────────────────────────────────── */}
        <TotalsBlock
          lineItems={lineItems}
          taxRate={meta.taxRate}
          currency={meta.currency}
        />

        {/* ── Notes (suppressed when empty) ───────────────────────── */}
        <NotesBlock notes={notes} />
      </div>
    </div>
  );
}
