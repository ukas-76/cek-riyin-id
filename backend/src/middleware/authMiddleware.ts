import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserTokenPayload } from '../utils/authUtils';

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload | null;
}

/**
 * Helper to extract token from cookies or Authorization header.
 */
function extractToken(req: Request): string | null {
  // Check cookie first
  if (req.cookies && req.cookies.cekriyin_token) {
    return req.cookies.cekriyin_token;
  }

  // Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Middleware enforcing mandatory authentication.
 * Rejects unauthenticated requests with 401 Unauthorized.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Sesi telah berakhir. Silakan login kembali.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Sesi telah berakhir. Silakan login kembali.' });
  }

  req.user = payload;
  return next();
}

/**
 * Middleware handling optional authentication.
 * Attaches user to req.user if token is present and valid; sets req.user = null if anonymous.
 * Never blocks request execution.
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (token) {
    const payload = verifyToken(token);
    req.user = payload || null;
  } else {
    req.user = null;
  }

  return next();
}
