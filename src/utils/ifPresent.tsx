import type { ReactNode } from 'react';

/**
 * Conditionally renders content only when `value` is a non-empty string.
 * Keeps JSX clean by avoiding verbose `{value && <span>{value}</span>}` patterns
 * that can render a stray `0` when value is falsy-but-not-empty.
 *
 * @param value  - The string to test.
 * @param render - Render function receiving the non-empty string.
 * @returns      The rendered node, or null.
 *
 * @example
 * {ifPresent(sender.phone, (v) => <span>{v}</span>)}
 */
export function ifPresent(
  value: string,
  render: (value: string) => ReactNode,
): ReactNode {
  if (typeof value === 'string' && value.trim().length > 0) {
    return render(value);
  }
  return null;
}
