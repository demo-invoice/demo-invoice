import React from 'react';
import type { BrandingState } from '../hooks/useBranding';

interface BrandingPreviewProps {
  branding: BrandingState;
}

/**
 * Live preview panel that reflects the currently selected branding options
 * before the user saves. Updates in real time via inline styles.
 */
export function BrandingPreview({ branding }: BrandingPreviewProps): React.ReactElement {
  const { primaryColor, secondaryColor, fontFamily } = branding;

  return (
    <div
      data-testid="branding-preview"
      style={{
        fontFamily,
        border: `2px solid ${primaryColor}`,
        borderRadius: 8,
        padding: '24px',
        backgroundColor: secondaryColor,
        maxWidth: 480,
      }}
    >
      <h2 style={{ color: primaryColor, margin: '0 0 8px' }}>Invoice Preview</h2>
      <p style={{ color: primaryColor, margin: '0 0 4px' }}>
        <strong>Client:</strong> Acme Corp
      </p>
      <p style={{ color: primaryColor, margin: '0 0 4px' }}>
        <strong>Invoice #:</strong> INV-0042
      </p>
      <p style={{ color: primaryColor, margin: 0 }}>
        <strong>Amount:</strong> $1,234.00
      </p>
    </div>
  );
}
