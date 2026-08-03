import type { ReactNode } from 'react';

export type ToastVariant = 'success' | 'error';

interface ToastProps {
  variant: ToastVariant;
  children: ReactNode;
  onDismiss: () => void;
}

const styles: Record<ToastVariant, React.CSSProperties> = {
  success: {
    background: '#d1fae5',
    border: '1px solid #6ee7b7',
    color: '#065f46',
  },
  error: {
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
  },
};

/**
 * Simple inline toast/banner for success and error feedback.
 * Renders above the action area; dismissed via the × button.
 */
export function Toast({ variant, children, onDismiss }: ToastProps) {
  return (
    <div
      role="alert"
      style={{
        ...styles[variant],
        borderRadius: 6,
        padding: '10px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        fontSize: 14,
      }}
    >
      <span>{children}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 18,
          lineHeight: 1,
          marginLeft: 12,
          color: 'inherit',
        }}
      >
        ×
      </button>
    </div>
  );
}
