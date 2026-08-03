import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { requireSelf } from '../middleware/requireSelf.js';
import { getBranding, upsertBranding } from '../services/brandingService.js';
import { APPROVED_FONTS } from '../constants/approvedFonts.js';

export const brandingRouter = Router();

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const approvedFontNames = Object.keys(APPROVED_FONTS) as [string, ...string[]];

const BrandingSchema = z.object({
  primary_color: z
    .string()
    .regex(HEX_COLOR_RE, 'primary_color must be a valid 6-digit hex color (e.g. #1A2B3C)'),
  secondary_color: z
    .string()
    .regex(HEX_COLOR_RE, 'secondary_color must be a valid 6-digit hex color (e.g. #1A2B3C)'),
  font_family: z
    .enum(approvedFontNames, {
      errorMap: () => ({
        message: `font_family must be one of: ${approvedFontNames.join(', ')}`,
      }),
    }),
});

/**
 * GET /api/users/:userId/branding
 * Returns the user's branding settings, or defaults if none saved.
 */
brandingRouter.get(
  '/api/users/:userId/branding',
  requireSelf,
  (req, res) => {
    const record = getBranding(getDb(), req.params['userId'] as string);
    res.json(record);
  }
);

/**
 * PUT /api/users/:userId/branding
 * Validates and saves branding settings for the user.
 */
brandingRouter.put(
  '/api/users/:userId/branding',
  requireSelf,
  (req, res) => {
    const result = BrandingSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        fields: result.error.flatten().fieldErrors,
      });
      return;
    }

    const saved = upsertBranding(getDb(), req.params['userId'] as string, result.data);
    res.status(200).json(saved);
  }
);
