import type { SenderInfo } from '../../types/invoice';
import { ifPresent } from '../../utils/ifPresent';
import styles from './InvoicePreview.module.css';

interface SenderBlockProps {
  sender: SenderInfo;
}

/**
 * Renders the sender (from) address block.
 * Optional fields (phone, addressLine2) are suppressed when empty.
 */
export function SenderBlock({ sender }: SenderBlockProps): JSX.Element {
  const cityLine = [sender.city, sender.state, sender.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <div className={styles.addressBlock}>
      {sender.name && (
        <span className={styles.addressName}>{sender.name}</span>
      )}
      {ifPresent(sender.addressLine1, (v) => <span>{v}</span>)}
      {ifPresent(sender.addressLine2, (v) => <span>{v}</span>)}
      {ifPresent(cityLine, (v) => <span>{v}</span>)}
      {ifPresent(sender.phone, (v) => <span>{v}</span>)}
      {ifPresent(sender.email, (v) => <span>{v}</span>)}
    </div>
  );
}
