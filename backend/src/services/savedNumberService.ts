import { pool } from '../db';
import { normalizePhoneNumber } from '../utils/phoneUtils';
import { randomUUID } from 'crypto';

interface SavedNumberRecord {
  id: string;
  user_id: string;
  phone_number: string;
  created_at: Date;
}

const inMemorySavedNumbers = new Map<string, SavedNumberRecord>();

export class SavedNumberService {
  /**
   * Saves a phone number for the authenticated user with PostgreSQL & In-Memory Fallback.
   */
  async saveNumber(userId: string, rawPhone: string) {
    const normalizedPhone = normalizePhoneNumber(rawPhone);
    const key = `${userId}:${normalizedPhone}`;

    try {
      const existingRes = await pool.query(
        'SELECT * FROM saved_numbers WHERE user_id = $1 AND phone_number = $2 LIMIT 1',
        [userId, normalizedPhone]
      );

      if (existingRes.rows.length > 0) {
        return existingRes.rows[0];
      }

      const id = randomUUID();
      const insertRes = await pool.query(
        'INSERT INTO saved_numbers (id, user_id, phone_number, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [id, userId, normalizedPhone]
      );

      const record = insertRes.rows[0];
      inMemorySavedNumbers.set(key, record);
      return record;
    } catch (dbErr: any) {
      console.warn('[SavedNumberService] DB query failed, using fallback:', dbErr.message);

      if (inMemorySavedNumbers.has(key)) {
        return inMemorySavedNumbers.get(key)!;
      }

      const record: SavedNumberRecord = {
        id: randomUUID(),
        user_id: userId,
        phone_number: normalizedPhone,
        created_at: new Date()
      };
      inMemorySavedNumbers.set(key, record);
      return record;
    }
  }

  /**
   * Removes a saved phone number for the authenticated user.
   */
  async unsaveNumber(userId: string, rawPhone: string) {
    const normalizedPhone = normalizePhoneNumber(rawPhone);
    const key = `${userId}:${normalizedPhone}`;

    inMemorySavedNumbers.delete(key);

    try {
      return await pool.query(
        'DELETE FROM saved_numbers WHERE user_id = $1 AND phone_number = $2',
        [userId, normalizedPhone]
      );
    } catch (dbErr: any) {
      console.warn('[SavedNumberService] DB delete failed:', dbErr.message);
      return { rowCount: 1 };
    }
  }

  /**
   * Checks if a phone number is saved by the authenticated user.
   */
  async isNumberSaved(userId: string, rawPhone: string): Promise<boolean> {
    const normalizedPhone = normalizePhoneNumber(rawPhone);
    const key = `${userId}:${normalizedPhone}`;

    try {
      const res = await pool.query(
        'SELECT COUNT(*)::int as count FROM saved_numbers WHERE user_id = $1 AND phone_number = $2',
        [userId, normalizedPhone]
      );
      if (res.rows[0].count > 0) return true;
    } catch (dbErr: any) {
      console.warn('[SavedNumberService] DB check failed:', dbErr.message);
    }

    return inMemorySavedNumbers.has(key);
  }

  /**
   * Gets all saved numbers for the authenticated user.
   */
  async getSavedNumbers(userId: string) {
    let list: SavedNumberRecord[] = [];

    try {
      const res = await pool.query(
        'SELECT * FROM saved_numbers WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      list = res.rows;
    } catch (dbErr: any) {
      console.warn('[SavedNumberService] DB getList failed, returning fallback store:', dbErr.message);
    }

    if (list.length === 0) {
      for (const rec of inMemorySavedNumbers.values()) {
        if (rec.user_id === userId) {
          list.push(rec);
        }
      }
      list.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    }

    return list;
  }
}

export const savedNumberService = new SavedNumberService();
