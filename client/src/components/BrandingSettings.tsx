import React, { useEffect } from 'react';
import { useBranding } from '../hooks/useBranding';
import { BrandingPreview } from './BrandingPreview';
import { APPROVED_FONTS } from '../constants/approvedFonts';

interface BrandingSettingsProps {
  userId: string;
  token: string;
}

const TOAST_DURATION_MS = 3000;

/**
 * Settings page for custom branding. Renders color pickers, font selector,
 * live preview, save button, and an auto-dismissing success toast.
 */
export function BrandingSettings({ userId, token }: BrandingSettingsProps): React.ReactElement {
  const {
    branding,
    loading,
    saveSuccess,
    saveError,
    setBranding,
    save,
    clearSaveSuccess,
  } = useBranding(userId, token);

  // Auto-dismiss the success toast after TOAST_DURATION_MS.
  // clearSaveSuccess is stable (useCallback) so this effect won't loop.
  useEffect(() => {
    if (!saveSuccess) return;
    const id = setTimeout(() => {
      clearSaveSuccess();
    }, TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [saveSuccess, clearSaveSuccess]);

  if (loading) {
    return <div>Loading branding settings…</div>;
  }

  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', padding: 24 }}>
      <div style={{ minWidth: 280 }}>
        <h1>Custom Branding</h1>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span>Primary Color</span>
          <input
            type="color"
            value={branding.primaryColor}
            onChange={(e) => setBranding({ primaryColor: e.target.value })}
            style={{ marginLeft: 8 }}
          />
          <code style={{ marginLeft: 8 }}>{branding.primaryColor}</code>
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span>Secondary Color</span>
          <input
            type="color"
            value={branding.secondaryColor}
            onChange={(e) => setBranding({ secondaryColor: e.target.value })}
            style={{ marginLeft: 8 }}
          />
          <code style={{ marginLeft: 8 }}>{branding.secondaryColor}</code>
        </label>

        <label style={{ display: 'block', marginBottom: 24 }}>
          <span>Font Family</span>
          <select
            value={branding.fontFamily}
            onChange={(e) => setBranding({ fontFamily: e.target.value })}
            style={{ marginLeft: 8, fontFamily: branding.fontFamily }}
          >
            {Object.entries(APPROVED_FONTS).map(([cssName, label]) => (
              <option key={cssName} value={cssName} style={{ fontFamily: cssName }}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button onClick={save} style={{ padding: '8px 24px', cursor: 'pointer' }}>
          Save Branding
        </button>

        {saveError && (
          <p role="alert" style={{ color: 'red', marginTop: 12 }}>
            {saveError}
          </p>
        )}

        {saveSuccess && (
          <p
            role="status"
            style={{
              color: 'green',
              marginTop: 12,
              padding: '8px 16px',
              border: '1px solid green',
              borderRadius: 4,
            }}
          >
            ✓ Branding saved successfully!
          </p>
        )}
      </div>

      <div>
        <h2 style={{ marginTop: 0 }}>Live Preview</h2>
        <BrandingPreview branding={branding} />
      </div>
    </div>
  );
}
