import express from 'express';
import path from 'path';
import { brandingRouter } from './api/branding/brandingRoutes';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());

// Serve bundled fonts statically for the frontend
app.use('/public/fonts', express.static(path.resolve(process.cwd(), 'assets', 'fonts')));

// TODO: Replace with real auth middleware that populates req.user from JWT/session
// For development, a stub is used so the server starts without auth infrastructure.
app.use(
  (
    req: express.Request & { user?: { id: string } },
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    // Stub: in production, decode JWT and set req.user = { id: decodedUserId }
    const devUserId = req.headers['x-dev-user-id'];
    if (typeof devUserId === 'string') {
      req.user = { id: devUserId };
    }
    next();
  },
);

app.use(brandingRouter);

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});

export { app };
