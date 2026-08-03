import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { brandingRouter } from './brandingRoutes';

// Mock the service layer so tests don't need a real SQLite DB
vi.mock('../../services/brandingService', () => ({
  getBranding: vi.fn((userId: string) => ({
    primary_color: '#2563EB',
    secondary_color: '#64748B',
    font_family: 'Inter',
  })),
  upsertBranding: vi.fn((_userId: string, payload: Record<string, unknown>) => ({
    ...payload,
  })),
  getDefaultBranding: vi.fn(() => ({
    primary_color: '#2563EB',
    secondary_color: '#64748B',
    font_family: 'Inter',
  })),
}));

import * as brandingService from '../../services/brandingService';

/** Build a test Express app with a fake auth middleware injecting a user id. */
function buildApp(authedUserId: string) {
  const app = express();
  app.use(express.json());
  // Inject fake authenticated user
  app.use((req: Request & { user?: { id: string } }, _res: Response, next: NextFunction) => {
    req.user = { id: authedUserId };
    next();
  });
  app.use(brandingRouter);
  return app;
}

describe('GET /api/users/:userId/branding', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('returns defaults for a new user', async () => {
    const app = buildApp('user-1');
    const res = await request(app).get('/api/users/user-1/branding');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      primary_color: '#2563EB',
    });
  });
});
