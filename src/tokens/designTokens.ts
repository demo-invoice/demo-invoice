/**
 * Design tokens — single source of truth (T3 contract).
 * All components import from here; no hard-coded hex or magic numbers elsewhere.
 */

export const colors = {
  /** Primary brand colour */
  primary: '#1a56db',
  /** Text on white backgrounds */
  textPrimary: '#111827',
  /** Secondary / muted text */
  textSecondary: '#6b7280',
  /** Divider / border */
  border: '#e5e7eb',
  /** Surface background for placeholders */
  surfaceMuted: '#f3f4f6',
  /** White */
  white: '#ffffff',
  /** Danger / error */
  danger: '#dc2626',
} as const;

export const typography = {
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  sizeXs: '0.625rem',
  sizeSm: '0.75rem',
  sizeBase: '0.875rem',
  sizeLg: '1rem',
  sizeXl: '1.25rem',
  size2xl: '1.5rem',
  weightNormal: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
  lineHeightSnug: '1.3',
  lineHeightNormal: '1.5',
} as const;

export const spacing = {
  px: '1px',
  '0': '0',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '16': '4rem',
} as const;

export const radii = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  preview: '0 8px 24px rgb(0 0 0 / 0.12)',
} as const;

/**
 * Injects all tokens as CSS custom properties on :root.
 * Call once at app entry point.
 */
export function injectCssVars(): void {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-surface-muted', colors.surfaceMuted);
  root.style.setProperty('--color-white', colors.white);
  root.style.setProperty('--font-family', typography.fontFamily);
  root.style.setProperty('--font-size-xs', typography.sizeXs);
  root.style.setProperty('--font-size-sm', typography.sizeSm);
  root.style.setProperty('--font-size-base', typography.sizeBase);
  root.style.setProperty('--font-size-lg', typography.sizeLg);
  root.style.setProperty('--font-size-xl', typography.sizeXl);
  root.style.setProperty('--font-size-2xl', typography.size2xl);
  root.style.setProperty('--shadow-preview', shadows.preview);
  root.style.setProperty('--radius-md', radii.md);
  root.style.setProperty('--spacing-4', spacing['4']);
  root.style.setProperty('--spacing-6', spacing['6']);
  root.style.setProperty('--spacing-8', spacing['8']);
}
