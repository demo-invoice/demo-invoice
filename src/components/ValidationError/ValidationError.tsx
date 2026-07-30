/**
 * ValidationError — reusable accessible error message component.
 *
 * - Renders null when there is no error, so screen readers only announce
 *   when the error actually appears.
 * - Uses role="alert" (implicit aria-live="assertive") for field-level errors
 *   so the message is announced immediately on appearance.
 * - The `id` prop must match the `aria-describedby` value on the associated input.
 * - For form-level summary errors, pass `live="polite"` to avoid interrupting
 *   the user mid-keystroke.
 *
 * Screen reader re-announcement: if the same error is re-triggered (e.g. double
 * submit), the parent should toggle the `key` prop to force a remount, which
 * causes the live region to re-fire.
 */
import styles from './ValidationError.module.css';

interface ValidationErrorProps {
  /** Unique id — referenced by the input's aria-describedby. */
  id: string;
  /** Error message string. Component renders null when falsy. */
  message: string | undefined;
  /** aria-live politeness. Defaults to 'assertive' (role=alert). */
  live?: 'assertive' | 'polite';
}

/**
 * Renders an accessible inline validation error message.
 */
export function ValidationError({ id, message, live = 'assertive' }: ValidationErrorProps) {
  if (!message) return null;

  return (
    <span
      id={id}
      className={styles.error}
      role={live === 'assertive' ? 'alert' : undefined}
      aria-live={live === 'polite' ? 'polite' : undefined}
    >
      {message}
    </span>
  );
}
