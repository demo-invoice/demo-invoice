/**
 * ValidationError — always rendered in the DOM (empty when no error) so that
 * aria-describedby references on inputs are never broken by a missing element.
 *
 * Toggle content, never mount/unmount.
 */
import styles from './ValidationError.module.css';

interface Props {
  /** Stable id referenced by the input's aria-describedby. */
  id: string;
  /** Error message, or empty string / undefined when valid. */
  message?: string;
}

/**
 * Renders a <span> with a stable id.
 * When message is falsy the span is empty but remains in the DOM.
 */
export function ValidationError({ id, message }: Props) {
  return (
    <span
      id={id}
      role={message ? 'alert' : undefined}
      className={styles.error}
      aria-hidden={!message}
    >
      {message ?? ''}
    </span>
  );
}
