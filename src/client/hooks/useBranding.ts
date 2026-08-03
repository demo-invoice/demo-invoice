import { useState, useEffect, useCallback } from 'react';
import { BrandingRecord } from '../../shared/brandingDefaults';
import { BRANDING_DEFAULTS } from '../../shared/brandingDefaults';

export interface UseBrandingResult {
  branding: BrandingRecord;
  setBranding: React.Dispatch<React.SetStateAction<BrandingRecord>>;
  save: () => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
}

/**
 * Fetches and manages branding state for a given user.
 * Exposes optimistic local state for live preview and a save() function
 * that PUTs to the API.
 */
export function useBranding(userId: string): UseBrandingResult {
  const [branding, setBranding] = useState<BrandingRecord>({ ...BRANDING_DEFAULTS });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/users/${userId}/branding`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load branding: ${res.status}`);
        return res.json() as Promise<BrandingRecord>;
      })
      .then((data) => {
        if (!cancelled) setBranding(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error('[useBranding] fetch error:', err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const save = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/users/${userId}/branding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `Save failed: ${res.status}`);
      }
      const saved = (await res.json()) as BrandingRecord;
      setBranding(saved);
      setSaveSuccess(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }, [userId, branding]);

  return { branding, setBranding, save, isSaving, saveError, saveSuccess };
}
