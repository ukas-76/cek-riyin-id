import { Router, Request, Response } from 'express';
import { commentService } from '../services/commentService';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/comments/user (Protected - List comments posted by user)
router.get('/user', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const comments = await commentService.getUserComments(userId);

    return res.status(200).json({ data: comments });
  } catch (error: any) {
    console.error('[User Comments GET Error]:', error);
    return res.status(500).json({ error: 'Gagal mengambil komentar pengguna.' });
  }
});

// GET /api/comments (Public - List comments for target item)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { target_type, target_reference } = req.query;

    if (!target_type || typeof target_type !== 'string' || !['number', 'message', 'link'].includes(target_type)) {
      return res.status(400).json({ error: 'Jenis target tidak valid.' });
    }

    if (!target_reference || typeof target_reference !== 'string' || !target_reference.trim()) {
      return res.status(400).json({ error: 'Referensi target tidak boleh kosong.' });
    }

    const comments = await commentService.getComments(target_type, target_reference);

    return res.status(200).json({ data: comments });
  } catch (error: any) {
    console.error('[Comment GET Error]:', error);
    return res.status(500).json({ error: 'Gagal mengambil komentar komunitas.' });
  }
});

// POST /api/comments (Protected - Post a new comment)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { target_type, target_reference, content } = req.body;

    if (!target_type || typeof target_type !== 'string' || !['number', 'message', 'link'].includes(target_type)) {
      return res.status(400).json({ error: 'Jenis target komentar tidak valid.' });
    }

    if (!target_reference || typeof target_reference !== 'string' || !target_reference.trim()) {
      return res.status(400).json({ error: 'Referensi target komentar tidak valid.' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Isi komentar tidak boleh kosong.' });
    }

    const userId = req.user!.id;
    const created = await commentService.createComment(userId, target_type, target_reference, content);

    return res.status(201).json({
      success: true,
      data: created
    });
  } catch (error: any) {
    console.error('[Comment POST Error]:', error);
    return res.status(400).json({ error: error.message || 'Gagal menambahkan komentar.' });
  }
});

// DELETE /api/comments/:id (Protected - Delete user comment)
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await commentService.deleteComment(userId, id);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('[Comment DELETE Error]:', error);
    return res.status(500).json({ error: 'Gagal menghapus komentar.' });
  }
});

export default router;
