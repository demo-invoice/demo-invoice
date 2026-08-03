import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { brandingRouter } from './brandingRoutes';

vi.mock('../../services/brandingService', () => ({
  getBranding: vi.fn((_userId: string) => ({
    primary_color: '#2563EB',
    secondary_color: '#64748B',
    font_family: 'Inter',
  })),
  upsertBranding: vi.fn((_userId: string, payload: unknown) => ({
    ...(payload as object),
  })),
  getDefaultBranding: vi.fn(() => ({
    primary_color: '#2563EB',
    secondary_color: '#64748B',
    font_family: 'Inter',
  })),
}));

import * as brandingService from '../../services/brandingService';

function buildApp(authedUserId: string) {
  const app = express();
  app.use(express.json());
  app.use((req: Request & { user?: { id: string } }, _res: Response, next: NextFunction) => {
    req.user = { id: authedUserId };
    next();
  });
  app.use(brandingRouter);
  return app;
}

const VALID_PAYLOAD = {
  primary_color: '#FF5733',
  secondary_color: '#33FF57',
  font_family: 'Roboto',
};

describe('GET /api/users/:userId/branding', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with branding defaults for a matching user', async () => {
    const app = buildApp('user-1');
    const res = await request(app).get('/api/users/user-1/branding');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      primary_color: '#2563EB',
      secondary_color: '#64748B',
      font_family: 'Inter',
    });
  });

  it('calls getBranding with the correct userId', async () => {
    const app = buildApp('user-42');
    await request(app).get('/api/users/user-42/branding');
    expect(brandingService.getBranding).toHaveBeenCalledWith('user-42');
  });

  it('returns 403 when authenticated user does not match :userId', async () => {
    const app = buildApp('user-1');
    const res = await request(app).get('/api/users/user-2/branding');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('does not call getBranding when 403 is returned', async () => {
    const app = buildApp('user-1');
    await request(app).get('/api/users/user-2/branding');
    expect(brandingService.getBranding).not.toHaveBeenCalled();
  });
});

describe('PUT /api/users/:userId/branding', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with saved branding on valid input', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send(VALID_PAYLOAD);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(VALID_PAYLOAD);
  });

  it('calls upsertBranding with userId and validated payload', async () => {
    const app = buildApp('user-1');
    await request(app).put('/api/users/user-1/branding').send(VALID_PAYLOAD);
    expect(brandingService.upsertBranding).toHaveBeenCalledWith('user-1', VALID_PAYLOAD);
  });

  it('returns 400 with field error for invalid primary_color (#GGG)', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...VALID_PAYLOAD, primary_color: '#GGG' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body.fields).toHaveProperty('primary_color');
  });

  it('returns 400 for shorthand hex on secondary_color (#FFF)', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...VALID_PAYLOAD, secondary_color: '#FFF' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('secondary_color');
  });

  it('returns 400 for named color as primary_color (red)', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...VALID_PAYLOAD, primary_color: 'red' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for hex without leading hash (2563EB)', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...VALID_PAYLOAD, primary_color: '2563EB' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('primary_color');
  });

  it('returns 400 for font not in approved list', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...VALID_PAYLOAD, font_family: 'Comic Sans' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('font_family');
  });

  it('returns 400 for path-traversal font name (../../etc/passwd)', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-1/branding')
      .send({ ...VALID_PAYLOAD, font_family: '../../etc/passwd' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('font_family');
  });

  it('returns 403 when writing to another user\'s branding', async () => {
    const app = buildApp('user-1');
    const res = await request(app)
      .put('/api/users/user-2/branding')
      .send(VALID_PAYLOAD);
    expect(res.status).toBe(403);
  });

  it('does not call upsertBranding when 403 is returned', async () => {
    const app = buildApp('user-1');
    await request(app).put('/api/users/user-2/branding').send(VALID_PAYLOAD);
    expect(brandingService.upsertBranding).not.toHaveBeenCalled();
  });

  it('returns 400 for missing primary_color field', async () => {
    const app = buildApp('user-1');
    const { primary_color: _, ...rest } = VALID_PAYLOAD;
    const res = await request(app).put('/api/users/user-1/branding').send(rest);
    expect(res.status).toBe(400);
  });

  it('returns 500 when upsertBranding throws a non-Zod error', async () => {
    vi.mocked(brandingService.upsertBranding).mockImplementationOnce(() => {
      throw new Error('DB connection lost');
    });
    const app = buildApp('user-1');
    const res = await request(app).put('/api/users/user-1/branding').send(VALID_PAYLOAD);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal server error');
  });
});
