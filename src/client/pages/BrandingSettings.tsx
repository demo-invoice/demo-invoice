import React, { useEffect, useRef } from 'react';
import { useBranding } from '../hooks/useBranding';
import { ColorInput } from '../components/ColorInput';
import { FontSelector } from '../components/FontSelector';
import { BrandingPreview } from '../components/BrandingPreview';
import { ApprovedFont } from '../../shared/brandingDefaults';

interface BrandingSettingsProps {
  userId: string;
}

/**
 * Branding settings page.
 * Composes ColorInput (×2), FontSelector, BrandingPreview, and a save button.
 * Live preview updates on every local state change before save.
 */
export function BrandingSettings({ userId }: BrandingSettingsProps): React.ReactElement {
  const { branding, setBranding, save, isSaving, saveError, saveSuccess } = useBranding(userId);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss success toast after 3 s
  useEffect(() => {
    if (saveSuccess) {
      successTimerRef.current = setTimeout(() => {
        setBranding((prev) => ({ ...prev })); // no-op state touch; toast hides via saveSuccess flag
      }, 3000);
    }
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [saveSuccess, setBranding]);

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Branding Settings</h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>
        Customize the colors and font used on your invoices.
      </p>

      <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
        {/* Form */}
        <section aria-label="Branding form" style={{ flex: '1 1 280px', minWidth: 280 }}>
          <ColorInput
            id="primary-color"
            label="Primary Color"
            value={branding.primary_color}
            onChange={(hex) => setBranding((prev) => ({ ...prev, primary_color: hex }))}
          />
          <ColorInput
            id="secondary-color"
            label="Secondary Color"
            value={branding.secondary_color}
            onChange={(hex) => setBranding((prev) => ({ ...prev, secondary_color: hex }))}
          />
          <FontSelector
            id="font-family"
            value={branding.font_family}
            onChange={(font: ApprovedFont) => setBranding((prev) => ({ ...prev, font_family: font }))}
          />

          <button
            onClick={save}
            disabled={isSaving}
            style={{
              marginTop: 8,
              padding: '10px 28px',
              background: branding.primary_color,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'Saving…' : 'Save Branding'}
          </button>

          {saveSuccess && (
            <p role="status" style={{ color: '#16A34A', marginTop: 12, fontWeight: 500 }}>
              ✓ Branding saved successfully!
            </p>
          )}
          {saveError && (
            <p role="alert" style={{ color: '#DC2626', marginTop: 12 }}>
              {saveError}
            </p>
          )}
        </section>

        {/* Live preview */}
        <section aria-label="Live invoice preview" style={{ flex: '0 0 auto' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#475569' }}>
            Live Preview
          </h2>
          <BrandingPreview branding={branding} />
        </section>
      </div>
    </main>
  );
}
