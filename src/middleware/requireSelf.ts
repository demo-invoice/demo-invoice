import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string | number;
}

/**
 * Middleware that ensures the authenticated user can only access their own
 * resources. Compares the JWT `userId` claim to the `:userId` route param.
 * Returns 403 if they do not match.
 */
export function requireSelf(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET ?? 'dev-secret';

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, secret) as JwtPayload;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Coerce both sides to string to handle numeric JWT sub claims.
  const tokenUserId = String(payload.userId);
  const routeUserId = String(req.params['userId']);

  if (tokenUserId !== routeUserId) {
    res.status(403).json({ error: 'Forbidden: cannot access another user\'s branding' });
    return;
  }

  next();
}
