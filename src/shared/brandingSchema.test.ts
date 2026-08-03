import { describe, it, expect } from 'vitest';
import { brandingSchema } from './brandingSchema';
import { APPROVED_FONTS } from './brandingDefaults';

const VALID = {
  primary_color: '#2563EB',
  secondary_color: '#64748B',
  font_family: 'Inter' as const,
};

describe('brandingSchema — valid inputs', () => {
  it('accepts a fully valid payload', () => {
    const result = brandingSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('accepts every approved font', () => {
    for (const font of APPROVED_FONTS) {
      const result = brandingSchema.safeParse({ ...VALID, font_family: font });
      expect(result.success, `font ${font} should be accepted`).toBe(true);
    }
  });

  it('accepts uppercase hex letters', () => {
    const result = brandingSchema.safeParse({ ...VALID, primary_color: '#AABBCC' });
    expect(result.success).toBe(true);
  });

  it('accepts lowercase hex letters', () => {
    const result = brandingSchema.safeParse({ ...VALID, secondary_color: '#aabbcc' });
    expect(result.success).toBe(true);
  });
});

describe('brandingSchema — invalid primary_color', () => {
  it('rejects shorthand hex (#FFF)', () => {
    const result = brandingSchema.safeParse({ ...VALID, primary_color: '#FFF' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields).toHaveProperty('primary_color');
    }
  });

  it('rejects named color (red)', () => {
    const result = brandingSchema.safeParse({ ...VALID, primary_color: 'red' });
    expect(result.success).toBe(false);
  });

  it('rejects hex without leading hash (2563EB)', () => {
    const result = brandingSchema.safeParse({ ...VALID, primary_color: '2563EB' });
    expect(result.success).toBe(false);
  });

  it('rejects wrong length (#12345G)', () => {
    const result = brandingSchema.safeParse({ ...VALID, primary_color: '#12345G' });
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = brandingSchema.safeParse({ ...VALID, primary_color: '' });
    expect(result.success).toBe(false);
  });
});

describe('brandingSchema — invalid secondary_color', () => {
  it('rejects shorthand hex (#ABC)', () => {
    const result = brandingSchema.safeParse({ ...VALID, secondary_color: '#ABC' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('secondary_color');
    }
  });

  it('rejects named color (blue)', () => {
    const result = brandingSchema.safeParse({ ...VALID, secondary_color: 'blue' });
    expect(result.success).toBe(false);
  });
});

describe('brandingSchema — invalid font_family', () => {
  it('rejects a font not in the approved list', () => {
    const result = brandingSchema.safeParse({ ...VALID, font_family: 'Comic Sans' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('font_family');
    }
  });

  it('rejects a path-traversal attempt (../../etc/passwd)', () => {
    const result = brandingSchema.safeParse({ ...VALID, font_family: '../../etc/passwd' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty string font', () => {
    const result = brandingSchema.safeParse({ ...VALID, font_family: '' });
    expect(result.success).toBe(false);
  });

  it('error message lists approved fonts', () => {
    const result = brandingSchema.safeParse({ ...VALID, font_family: 'Unknown' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0].message;
      expect(msg).toContain('Inter');
    }
  });
});

describe('brandingSchema — missing fields', () => {
  it('rejects payload missing primary_color', () => {
    const { primary_color: _, ...rest } = VALID;
    const result = brandingSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects payload missing font_family', () => {
    const { font_family: _, ...rest } = VALID;
    const result = brandingSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
