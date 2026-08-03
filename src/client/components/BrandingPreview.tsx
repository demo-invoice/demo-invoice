import React from 'react';
import { BrandingRecord } from '../../shared/brandingDefaults';

interface BrandingPreviewProps {
  branding: BrandingRecord;
}

/**
 * Read-only mock invoice card that reflects the current branding settings.
 * Updates instantly on prop change — no save required.
 */
export function BrandingPreview({ branding }: BrandingPreviewProps): React.ReactElement {
  const { primary_color, secondary_color, font_family } = branding;

  return (
    <div
      aria-label="Invoice preview"
      style={{
        fontFamily: font_family,
        border: `2px solid ${secondary_color}`,
        borderRadius: 8,
        overflow: 'hidden',
        width: 340,
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: primary_color,
          color: '#fff',
          padding: '14px 20px',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        INVOICE
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', background: '#fff' }}>
        <div style={{ marginBottom: 8, color: '#333', fontSize: 13 }}>
          <strong>Invoice #:</strong> INV-0001
        </div>
        <div style={{ marginBottom: 8, color: '#333', fontSize: 13 }}>
          <strong>Date:</strong> 2024-01-01
        </div>
        <div style={{ marginBottom: 8, color: '#333', fontSize: 13 }}>
          <strong>Client:</strong> Acme Corp
        </div>

        {/* Accent divider */}
        <div
          style={{
            borderTop: `2px solid ${secondary_color}`,
            margin: '12px 0',
          }}
        />

        {/* Line items */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span>Design services</span>
          <span>$1,200.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
          <span>Development</span>
          <span>$3,400.00</span>
        </div>

        {/* Totals row */}
        <div
          style={{
            background: primary_color,
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <span>Total</span>
          <span>$4,600.00</span>
        </div>
      </div>
    </div>
  );
}
