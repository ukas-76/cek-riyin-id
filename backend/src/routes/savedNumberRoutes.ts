import { Router, Response } from 'express';
import { savedNumberService } from '../services/savedNumberService';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { validatePhoneNumber } from '../utils/phoneUtils';

const router = Router();

// POST /api/saved-numbers (Save a phone number)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number || typeof phone_number !== 'string' || !phone_number.trim()) {
      return res.status(400).json({ error: 'Nomor telepon tidak boleh kosong.' });
    }

    const validation = validatePhoneNumber(phone_number);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const userId = req.user!.id;
    const result = await savedNumberService.saveNumber(userId, phone_number);

    return res.status(201).json({
      success: true,
      isSaved: true,
      data: result
    });
  } catch (error: any) {
    console.error('[SavedNumber POST Error]:', error);
    return res.status(500).json({ error: 'Gagal menyimpan nomor telepon.' });
  }
});

// DELETE /api/saved-numbers/:phone_number (Unsave a phone number)
router.delete('/:phone_number', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phone_number } = req.params;
    if (!phone_number) {
      return res.status(400).json({ error: 'Nomor telepon tidak valid.' });
    }

    const userId = req.user!.id;
    await savedNumberService.unsaveNumber(userId, phone_number);

    return res.status(200).json({
      success: true,
      isSaved: false
    });
  } catch (error: any) {
    console.error('[SavedNumber DELETE Error]:', error);
    return res.status(500).json({ error: 'Gagal menghapus nomor dari tersimpan.' });
  }
});

// GET /api/saved-numbers/check/:phone_number (Check if number is saved)
router.get('/check/:phone_number', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phone_number } = req.params;
    if (!phone_number) {
      return res.status(400).json({ error: 'Nomor telepon tidak valid.' });
    }

    const userId = req.user!.id;
    const isSaved = await savedNumberService.isNumberSaved(userId, phone_number);

    return res.status(200).json({ isSaved });
  } catch (error: any) {
    console.error('[SavedNumber CHECK Error]:', error);
    return res.status(500).json({ error: 'Gagal memeriksa status simpan.' });
  }
});

// GET /api/saved-numbers (List all saved numbers for user)
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const list = await savedNumberService.getSavedNumbers(userId);

    return res.status(200).json({ data: list });
  } catch (error: any) {
    console.error('[SavedNumber GET Error]:', error);
    return res.status(500).json({ error: 'Gagal mengambil daftar nomor tersimpan.' });
  }
});

export default router;
