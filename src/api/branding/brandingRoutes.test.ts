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
  upsertBranding: vi.fn((_userId: string, payload: unknown) => ({
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
      secondary_color: '#64748B',
      font_family: 'Inter',
    });
  });

  it('returns 403 when accessing another user\'s branding', async () => {
    const app = buildApp('user-1');
    const res = await request(app).get('/api/users/user-2/branding');
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/users/:userId/branding', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('saves valid branding and returns saved record', async () => {
    const app = buildApp('user-1');
    const payload = {
      primary_color: '#FF5733',
      secondary_color: '#33FF57',
      font_family: 'Roboto',
    };
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send(payload)
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(payload);
  });

  it('returns 400 for invalid hex color', async () => {
    const app = buildApp('user-1');
    const payload = {
      primary_color: 'not-a-color',
      secondary_color: '#33FF57',
      font_family: 'Roboto',
    };
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send(payload)
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid font family', async () => {
    const app = buildApp('user-1');
    const payload = {
      primary_color: '#FF5733',
      secondary_color: '#33FF57',
      font_family: 'ComicSans',
    };
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send(payload)
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 403 when updating another user\'s branding', async () => {
    const app = buildApp('user-1');
    const payload = {
      primary_color: '#FF5733',
      secondary_color: '#33FF57',
      font_family: 'Roboto',
    };
    const res = await request(app)
      .put('/api/users/user-2/branding')
      .send(payload)
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(403);
  });
});
