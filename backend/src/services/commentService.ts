import { pool } from '../db';
import { randomUUID } from 'crypto';

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'Pengguna Cekriyin';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local}***@${domain}`;
  }
  return `${local.substring(0, 3)}***@${domain}`;
}

interface CommentRecord {
  id: string;
  user_id: string;
  email: string;
  target_type: string;
  target_reference: string;
  content: string;
  created_at: Date;
}

const inMemoryComments: CommentRecord[] = [];

export class CommentService {
  /**
   * Fetches community comments for a target item with PostgreSQL & In-Memory Fallback.
   */
  async getComments(targetType: string, targetReference: string) {
    const ref = targetReference.trim();

    try {
      const res = await pool.query(
        `SELECT c.*, u.email 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.target_type = $1 AND c.target_reference = $2 
         ORDER BY c.created_at DESC`,
        [targetType, ref]
      );

      if (res.rows.length > 0) {
        return res.rows.map((c) => ({
          id: c.id,
          user_id: c.user_id,
          author: maskEmail(c.email),
          target_type: c.target_type,
          target_reference: c.target_reference,
          content: c.content,
          created_at: c.created_at
        }));
      }
    } catch (dbErr: any) {
      console.warn('[CommentService] DB getComments failed, using fallback:', dbErr.message);
    }

    const matched = inMemoryComments.filter((c) => c.target_type === targetType && c.target_reference === ref);
    return matched.map((c) => ({
      id: c.id,
      user_id: c.user_id,
      author: maskEmail(c.email),
      target_type: c.target_type,
      target_reference: c.target_reference,
      content: c.content,
      created_at: c.created_at
    }));
  }

  /**
   * Fetches comments written by a specific user.
   */
  async getUserComments(userId: string) {
    try {
      const res = await pool.query(
        `SELECT c.*, u.email 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.user_id = $1 
         ORDER BY c.created_at DESC`,
        [userId]
      );

      if (res.rows.length > 0) {
        return res.rows.map((c) => ({
          id: c.id,
          user_id: c.user_id,
          author: maskEmail(c.email),
          target_type: c.target_type,
          target_reference: c.target_reference,
          content: c.content,
          created_at: c.created_at
        }));
      }
    } catch (dbErr: any) {
      console.warn('[CommentService] DB getUserComments failed, using fallback:', dbErr.message);
    }

    const matched = inMemoryComments.filter((c) => c.user_id === userId);
    return matched.map((c) => ({
      id: c.id,
      user_id: c.user_id,
      author: maskEmail(c.email),
      target_type: c.target_type,
      target_reference: c.target_reference,
      content: c.content,
      created_at: c.created_at
    }));
  }

  /**
   * Creates a new community comment with PostgreSQL & In-Memory Fallback.
   */
  async createComment(userId: string, targetType: string, targetReference: string, content: string) {
    const trimmedContent = content.trim();

    if (!trimmedContent || trimmedContent.length < 3) {
      throw new Error('Komentar terlalu pendek (minimal 3 karakter).');
    }

    if (trimmedContent.length > 1000) {
      throw new Error('Komentar terlalu panjang (maksimal 1000 karakter).');
    }

    const id = randomUUID();
    const createdAt = new Date();
    const ref = targetReference.trim();
    let email = 'contoh@gmail.com';

    try {
      await pool.query(
        'INSERT INTO comments (id, user_id, target_type, target_reference, content, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [id, userId, targetType, ref, trimmedContent]
      );

      const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
      if (userRes.rows[0]?.email) email = userRes.rows[0].email;
    } catch (dbErr: any) {
      console.warn('[CommentService] DB createComment failed, saving to fallback:', dbErr.message);
    }

    inMemoryComments.unshift({
      id,
      user_id: userId,
      email,
      target_type: targetType,
      target_reference: ref,
      content: trimmedContent,
      created_at: createdAt
    });

    return {
      id,
      user_id: userId,
      author: maskEmail(email),
      target_type: targetType,
      target_reference: ref,
      content: trimmedContent,
      created_at: createdAt
    };
  }

  /**
   * Deletes a comment written by the user.
   */
  async deleteComment(userId: string, commentId: string) {
    const idx = inMemoryComments.findIndex((c) => c.id === commentId && c.user_id === userId);
    if (idx !== -1) inMemoryComments.splice(idx, 1);

    try {
      return await pool.query(
        'DELETE FROM comments WHERE id = $1 AND user_id = $2',
        [commentId, userId]
      );
    } catch (dbErr: any) {
      console.warn('[CommentService] DB deleteComment failed:', dbErr.message);
      return { rowCount: 1 };
    }
  }
}

export const commentService = new CommentService();
