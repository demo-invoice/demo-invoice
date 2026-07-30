import styles from './InvoicePreview.module.css';

interface LogoPlaceholderProps {
  /** Data-URL or remote URL. When empty, renders a grey placeholder box. */
  logoUrl: string;
}

/**
 * Renders either the invoice logo image or a neutral grey placeholder box.
 * Sizing and colours are driven entirely by design tokens via CSS custom props.
 */
export function LogoPlaceholder({ logoUrl }: LogoPlaceholderProps): JSX.Element {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Company logo"
        className={styles.logoImage}
      />
    );
  }

  return (
    <div className={styles.logoPlaceholder} aria-label="Logo placeholder">
      LOGO
    </div>
  );
}
