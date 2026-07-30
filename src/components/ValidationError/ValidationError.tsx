/**
 * ValidationError — always-mounted ARIA live region.
 *
 * The container element is ALWAYS rendered (never returns null) so that
 * VoiceOver / NVDA register the live region before any text is inserted.
 * Conditionally mounting the element and then setting text in the same
 * render tick is a known anti-pattern: screen readers miss the announcement
 * because they haven't observed the region yet.
 *
 * Usage:
 *   <ValidationError id="error-client-name" message={errors.clientName} />
 *   <input aria-describedby="error-client-name" ... />
 */

export interface ValidationErrorProps {
  /** Must match the aria-describedby value on the associated input. */
  id: string;
  /** Error message to announce. Pass undefined / empty string when valid. */
  message?: string;
  /**
   * 'assertive' (default) — interrupts the user immediately (role="alert").
   * 'polite' — waits for the user to be idle (role="status").
   */
  live?: 'assertive' | 'polite';
}

export function ValidationError({ id, message, live = 'assertive' }: ValidationErrorProps) {
  const role = live === 'assertive' ? 'alert' : 'status';
  return (
    <span
      id={id}
      role={role}
      aria-live={live}
      style={{
        display: 'block',
        minHeight: '1.25em',
        color: 'var(--color-error, #b91c1c)',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
      }}
    >
      {message ?? ''}
    </span>
  );
}
