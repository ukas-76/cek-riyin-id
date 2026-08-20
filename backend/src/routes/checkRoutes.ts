import { Router, Response } from 'express';
import { pool } from '../db';
import { validatePhoneNumber } from '../utils/phoneUtils';
import { parseAndValidateUrl } from '../utils/urlDetector';
import { checkService, inMemoryChecksHistory } from '../services/checkService';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/check/history (Protected - List user's check history)
router.get('/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let list: any[] = [];

    try {
      const dbRes = await pool.query(
        'SELECT * FROM checks WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      list = dbRes.rows;
    } catch (e: any) {
      console.warn('[Check History GET] DB query skipped:', e.message);
    }

    if (list.length === 0) {
      list = inMemoryChecksHistory.filter((c) => c.user_id === userId);
    }

    return res.status(200).json({ data: list });
  } catch (error: any) {
    console.error('[Check History GET Error]:', error);
    return res.status(200).json({ data: [] });
  }
});

// POST /api/check (Public & Optional Auth)
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, input } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Jenis pengecekan tidak valid.' });
    }

    if (!['number', 'message', 'link'].includes(type)) {
      return res.status(400).json({ error: 'Mode pengecekan harus salah satu dari: number, message, link.' });
    }

    if (!input || typeof input !== 'string' || !input.trim()) {
      const fieldName = type === 'number' ? 'nomor telepon' : type === 'message' ? 'isi pesan' : 'link / URL';
      return res.status(400).json({ error: `Masukkan ${fieldName} yang ingin dicek.` });
    }

    // Mode-specific validation
    if (type === 'number') {
      const phoneValidation = validatePhoneNumber(input);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ error: phoneValidation.error });
      }
    } else if (type === 'message') {
      if (input.trim().length < 5) {
        return res.status(400).json({ error: 'Isi pesan terlalu pendek untuk dianalisis.' });
      }
    } else if (type === 'link') {
      const urlValidation = parseAndValidateUrl(input);
      if (!urlValidation.valid) {
        return res.status(400).json({ error: urlValidation.error });
      }
    }

    // Process check (attaches user_id if logged in, null if anonymous)
    const result = await checkService.processCheck({
      type: type as 'number' | 'message' | 'link',
      input: input.trim(),
      userId: req.user ? req.user.id : null
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Check API Error]:', error);
    return res.status(500).json({ error: error.message || 'Pengecekan gagal. Silakan coba lagi.' });
  }
});

export default router;
