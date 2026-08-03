/**
 * Toast
 *
 * Lightweight notification banner. Auto-dismisses after 4 seconds.
 * Accepts an onDismiss callback for manual close or post-dismiss cleanup.
 */
import React, { useEffect } from 'react';

interface Props {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ message, onDismiss, durationMs = 4000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={toastStyle}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={closeBtn}
      >
        ×
      </button>
    </div>
  );
}

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  background: '#323232',
  color: '#fff',
  padding: '12px 20px',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
  zIndex: 2000,
  fontSize: 14,
};

const closeBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: 20,
  cursor: 'pointer',
  lineHeight: 1,
  padding: 0,
};
