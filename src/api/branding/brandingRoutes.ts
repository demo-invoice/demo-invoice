import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { getBranding, upsertBranding } from '../../services/brandingService';
import { brandingSchema } from '../../shared/brandingSchema';

export const brandingRouter = Router();

/**
 * Auth guard: ensures the authenticated user can only access their own branding.
 * Expects `req.user` to be populated by upstream auth middleware.
 */
function requireSelf(
  req: Request & { user?: { id: string } },
  res: Response,
  next: NextFunction,
): void {
  const authedId = req.user?.id;
  if (!authedId || authedId !== req.params.userId) {
    res.status(403).json({ error: 'Forbidden: cannot access another user\'s branding' });
    return;
  }
  next();
}

/**
 * GET /api/users/:userId/branding
 * Returns the user's saved branding, or defaults if none saved.
 */
brandingRouter.get(
  '/api/users/:userId/branding',
  requireSelf,
  (req: Request & { user?: { id: string } }, res: Response): void => {
    const branding = getBranding(req.params.userId);
    res.status(200).json(branding);
  },
);

/**
 * PUT /api/users/:userId/branding
 * Validates and upserts the user's branding.
 * Returns 400 with field-level errors on validation failure.
 */
brandingRouter.put(
  '/api/users/:userId/branding',
  requireSelf,
  (req: Request & { user?: { id: string } }, res: Response): void => {
    const result = brandingSchema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      res.status(400).json({ error: 'Validation failed', fields: fieldErrors });
      return;
    }

    try {
      const saved = upsertBranding(req.params.userId, result.data);
      res.status(200).json(saved);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: 'Validation failed', fields: err.flatten().fieldErrors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },
);
