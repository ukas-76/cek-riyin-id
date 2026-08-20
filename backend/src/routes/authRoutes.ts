import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as any,
  secure: process.env.NODE_ENV === 'production',
  domain: process.env.NODE_ENV === 'production' ? '.cekriyin.id' : undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register({ email, password });

    res.cookie('cekriyin_token', result.token, COOKIE_OPTIONS);

    return res.status(201).json({
      message: 'Registrasi berhasil',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    const statusCode = error.message.includes('sudah terdaftar') || error.message.includes('wajib') ? 400 : 400;
    return res.status(statusCode).json({ error: error.message || 'Registrasi gagal.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.cookie('cekriyin_token', result.token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: 'Login berhasil',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Login gagal.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('cekriyin_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return res.status(200).json({ message: 'Logout berhasil' });
});

// GET /api/auth/me
router.get('/me', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(200).json({ authenticated: false, user: null });
    }

    const user = await authService.getCurrentUser(req.user.id);
    if (!user) {
      return res.status(200).json({ authenticated: false, user: null });
    }

    return res.status(200).json({
      authenticated: true,
      user
    });
  } catch (error) {
    return res.status(200).json({ authenticated: false, user: null });
  }
});

export default router;
