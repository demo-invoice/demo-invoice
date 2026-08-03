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
  const validPayload = {
    primary_color: '#FF5733',
    secondary_color: '#33FF57',
    font_family: 'Roboto',
  };

  it('saves and returns the branding record on valid input', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send(validPayload);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(validPayload);
  });

  it('returns 400 with field error for invalid hex color', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...validPayload, primary_color: '#GGG' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('primary_color');
  });

  it('returns 400 for shorthand hex (#FFF)', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...validPayload, secondary_color: '#FFF' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('secondary_color');
  });

  it('returns 400 for named color ("red")', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...validPayload, primary_color: 'red' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for font not in approved list', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...validPayload, font_family: '../../etc/passwd' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('font_family');
  });

  it('returns 403 when writing to another user\'s branding', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-2/branding')
      .send(validPayload);
    expect(res.status).toBe(403);
  });
});
