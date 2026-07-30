import type { ClientInfo } from '../../types/invoice';
import { ifPresent } from '../../utils/ifPresent';
import styles from './InvoicePreview.module.css';

interface BillToBlockProps {
  client: ClientInfo;
}

/**
 * Renders the "Bill To" client address block.
 * addressLine2 and email are suppressed when empty.
 */
export function BillToBlock({ client }: BillToBlockProps): JSX.Element {
  const cityLine = [client.city, client.state, client.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <div className={styles.addressBlock}>
      <span className={styles.addressLabel}>Bill To</span>
      {client.name && (
        <span className={styles.addressName}>{client.name}</span>
      )}
      {ifPresent(client.addressLine1, (v) => <span>{v}</span>)}
      {ifPresent(client.addressLine2, (v) => <span>{v}</span>)}
      {ifPresent(cityLine, (v) => <span>{v}</span>)}
      {ifPresent(client.email, (v) => <span>{v}</span>)}
    </div>
  );
}
