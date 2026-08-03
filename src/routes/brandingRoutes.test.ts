import { vi, describe, it, expect, beforeEach } from 'vitest';

// Must be hoisted before any import that transitively pulls in db.ts
vi.mock('../db.js', () => ({
  getDb: vi.fn(),
}));

import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { brandingRouter } from './brandingRoutes.js';
import * as brandingService from '../services/brandingService.js';

const JWT_SECRET = 'dev-secret';

function makeToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET);
}

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(brandingRouter);
  return app;
}

const DEFAULT_BRANDING = {
  user_id: '42',
  primary_color: '#000000',
  secondary_color: '#FFFFFF',
  font_family: 'Inter',
  updated_at: '2024-01-01T00:00:00.000Z',
};

describe('GET /api/users/:userId/branding', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with defaults when no record exists', async () => {
    vi.spyOn(brandingService, 'getBranding').mockReturnValue(DEFAULT_BRANDING);

    const res = await request(buildApp())
      .get('/api/users/42/branding')
      .set('Authorization', `Bearer ${makeToken('42')}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      primary_color: '#000000',
      secondary_color: '#FFFFFF',
      font_family: 'Inter',
    });
  });

  it('returns 200 with saved record when one exists', async () => {
    const saved = { ...DEFAULT_BRANDING, primary_color: '#123456', font_family: 'Roboto' };
    vi.spyOn(brandingService, 'getBranding').mockReturnValue(saved);

    const res = await request(buildApp())
      .get('/api/users/42/branding')
      .set('Authorization', `Bearer ${makeToken('42')}`);

    expect(res.status).toBe(200);
    expect(res.body.primary_color).toBe('#123456');
    expect(res.body.font_family).toBe('Roboto');
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(buildApp()).get('/api/users/42/branding');
    expect(res.status).toBe(401);
  });

  it('returns 403 when JWT userId does not match route :userId', async () => {
    const res = await request(buildApp())
      .get('/api/users/42/branding')
      .set('Authorization', `Bearer ${makeToken('99')}`);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/users/:userId/branding', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('(1) valid payload returns 200 with the saved branding record', async () => {
    const saved = {
      ...DEFAULT_BRANDING,
      primary_color: '#AABBCC',
      secondary_color: '#112233',
      font_family: 'Open Sans',
    };
    vi.spyOn(brandingService, 'upsertBranding').mockReturnValue(saved);

    const res = await request(buildApp())
      .put('/api/users/42/branding')
      .set('Authorization', `Bearer ${makeToken('42')}`)
      .send({ primary_color: '#AABBCC', secondary_color: '#112233', font_family: 'Open Sans' });

    expect(res.status).toBe(200);
    expect(res.body.primary_color).toBe('#AABBCC');
    expect(res.body.secondary_color).toBe('#112233');
    expect(res.body.font_family).toBe('Open Sans');
  });

  it('(2) 7-digit hex color returns 400 with field-level Zod errors', async () => {
    const res = await request(buildApp())
      .put('/api/users/42/branding')
      .set('Authorization', `Bearer ${makeToken('42')}`)
      .send({ primary_color: '#1A2B3CD', secondary_color: '#FFFFFF', font_family: 'Inter' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.fields).toHaveProperty('primary_color');
  });

  it('(2b) non-hex string color returns 400 with field-level errors', async () => {
    const res = await request(buildApp())
      .put('/api/users/42/branding')
      .set('Authorization', `Bearer ${makeToken('42')}`)
      .send({ primary_color: 'notahex', secondary_color: '#FFFFFF', font_family: 'Inter' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.fields).toHaveProperty('primary_color');
  });

  it('(2c) font not in APPROVED_FONTS returns 400 with field-level errors', async () => {
    const res = await request(buildApp())
      .put('/api/users/42/branding')
      .set('Authorization', `Bearer ${makeToken('42')}`)
      .send({ primary_color: '#000000', secondary_color: '#FFFFFF', font_family: 'Comic Sans' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.fields).toHaveProperty('font_family');
  });

  it('(3) JWT userId does not match route :userId returns 403', async () => {
    const res = await request(buildApp())
      .put('/api/users/42/branding')
      .set('Authorization', `Bearer ${makeToken('99')}`)
      .send({ primary_color: '#000000', secondary_color: '#FFFFFF', font_family: 'Inter' });

    expect(res.status).toBe(403);
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(buildApp())
      .put('/api/users/42/branding')
      .send({ primary_color: '#000000', secondary_color: '#FFFFFF', font_family: 'Inter' });
    expect(res.status).toBe(401);
  });

  it('all seven approved fonts are accepted', async () => {
    const approvedFonts = [
      'Inter', 'Roboto', 'Lato', 'Open Sans',
      'Merriweather', 'Playfair Display', 'Source Sans Pro',
    ];

    for (const font of approvedFonts) {
      const saved = { ...DEFAULT_BRANDING, font_family: font };
      vi.spyOn(brandingService, 'upsertBranding').mockReturnValue(saved);

      const res = await request(buildApp())
        .put('/api/users/42/branding')
        .set('Authorization', `Bearer ${makeToken('42')}`)
        .send({ primary_color: '#000000', secondary_color: '#FFFFFF', font_family: font });

      expect(res.status).toBe(200);
      vi.restoreAllMocks();
    }
  });
});
