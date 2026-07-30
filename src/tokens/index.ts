/**
 * Design token layer (T3 contract).
 * All preview and form components import exclusively from here.
 * Zero hard-coded hex values or magic numbers elsewhere.
 */
export const tokens = {
  color: {
    /** Page / app background */
    background: '#f4f5f7',
    /** Card / panel surface */
    surface: '#ffffff',
    /** Primary body text */
    text: '#1a1a2e',
    /** Secondary / muted text */
    textMuted: '#6b7280',
    /** Border and divider lines */
    border: '#e5e7eb',
    /** Placeholder box background (logo, image slots) */
    placeholder: '#d1d5db',
    /** Accent / brand colour */
    accent: '#4f46e5',
    /** Table header background */
    tableHeader: '#f9fafb',
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    size: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      md: '16px',
      lg: '20px',
      xl: '28px',
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.6,
    },
  },
  spacing: {
    '0': '0px',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
} as const;

export type Tokens = typeof tokens;
