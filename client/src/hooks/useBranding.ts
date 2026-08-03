import { useState, useEffect, useCallback } from 'react';

export interface BrandingState {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface UseBrandingReturn {
  branding: BrandingState;
  loading: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  setBranding: (updates: Partial<BrandingState>) => void;
  save: () => Promise<void>;
  clearSaveSuccess: () => void;
}

const DEFAULTS: BrandingState = {
  primaryColor: '#000000',
  secondaryColor: '#FFFFFF',
  fontFamily: 'Inter',
};

/**
 * Manages branding state for the current user.
 * Fetches from the API on mount, exposes save() and clearSaveSuccess().
 * clearSaveSuccess is stable (useCallback) to avoid infinite re-render loops.
 */
export function useBranding(userId: string, token: string): UseBrandingReturn {
  const [branding, setBrandingState] = useState<BrandingState>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/users/${userId}/branding`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: { primary_color: string; secondary_color: string; font_family: string }) => {
        if (!cancelled) {
          setBrandingState({
            primaryColor: data.primary_color,
            secondaryColor: data.secondary_color,
            fontFamily: data.font_family,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setSaveError('Failed to load branding settings.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId, token]);

  const setBranding = useCallback((updates: Partial<BrandingState>) => {
    setBrandingState((prev) => ({ ...prev, ...updates }));
  }, []);

  const save = useCallback(async () => {
    setSaveError(null);
    try {
      const res = await fetch(`/api/users/${userId}/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          primary_color: branding.primaryColor,
          secondary_color: branding.secondaryColor,
          font_family: branding.fontFamily,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setSaveError(body.error ?? 'Failed to save branding.');
        return;
      }

      setSaveSuccess(true);
    } catch {
      setSaveError('Network error — could not save branding.');
    }
  }, [userId, token, branding]);

  /** Sets saveSuccess to false. Stable reference — safe in useEffect deps. */
  const clearSaveSuccess = useCallback(() => {
    setSaveSuccess(false);
  }, []);

  return { branding, loading, saveSuccess, saveError, setBranding, save, clearSaveSuccess };
}
