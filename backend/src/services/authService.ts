import { pool } from '../db';
import { hashPassword, comparePassword, generateToken } from '../utils/authUtils';
import { randomUUID } from 'crypto';

export interface UserResponse {
  id: string;
  email: string;
  created_at: Date;
}

export interface AuthResult {
  user: UserResponse;
  token: string;
}

// In-memory fallback storage when PostgreSQL is unavailable
const inMemoryUsers = new Map<string, { id: string; email: string; password_hash: string; created_at: Date }>();

export class AuthService {
  /**
   * Registers a new user with PostgreSQL & In-Memory Fallback.
   */
  async register(params: { email?: string; password?: string }): Promise<AuthResult> {
    const { email, password } = params;

    if (!email || !email.trim()) {
      throw new Error('Email wajib diisi.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Masukkan email yang valid.');
    }

    if (!password || !password.trim()) {
      throw new Error('Password wajib diisi.');
    }

    if (password.length < 6) {
      throw new Error('Password minimal 6 karakter.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);
    const id = randomUUID();
    const createdAt = new Date();

    // 1. Try PostgreSQL insert
    try {
      const existing = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);
      if (existing.rows.length > 0) {
        throw new Error('Email sudah terdaftar.');
      }

      const insertRes = await pool.query(
        'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, created_at',
        [id, normalizedEmail, passwordHash]
      );

      const newUser = insertRes.rows[0];
      const token = generateToken({ id: newUser.id, email: newUser.email });

      // Save to fallback memory too
      inMemoryUsers.set(normalizedEmail, { id: newUser.id, email: newUser.email, password_hash: passwordHash, created_at: newUser.created_at });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          created_at: newUser.created_at
        },
        token
      };
    } catch (dbErr: any) {
      if (dbErr.message === 'Email sudah terdaftar.') {
        throw dbErr;
      }

      console.warn('[AuthService] PostgreSQL insert failed, using fallback store:', dbErr.message);

      if (inMemoryUsers.has(normalizedEmail)) {
        throw new Error('Email sudah terdaftar.');
      }

      const userRecord = { id, email: normalizedEmail, password_hash: passwordHash, created_at: createdAt };
      inMemoryUsers.set(normalizedEmail, userRecord);

      const token = generateToken({ id, email: normalizedEmail });

      return {
        user: {
          id,
          email: normalizedEmail,
          created_at: createdAt
        },
        token
      };
    }
  }

  /**
   * Authenticates a user login with PostgreSQL & In-Memory Fallback.
   */
  async login(params: { email?: string; password?: string }): Promise<AuthResult> {
    const { email, password } = params;

    if (!email || !email.trim()) {
      throw new Error('Email wajib diisi.');
    }

    if (!password || !password.trim()) {
      throw new Error('Password wajib diisi.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try PostgreSQL lookup
    try {
      const res = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);
      if (res.rows.length > 0) {
        const user = res.rows[0];
        const isPasswordValid = await comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
          throw new Error('Email atau password salah.');
        }

        const token = generateToken({ id: user.id, email: user.email });
        return {
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          },
          token
        };
      }
    } catch (dbErr: any) {
      console.warn('[AuthService] PostgreSQL login failed, checking fallback store:', dbErr.message);
    }

    // 2. Check in-memory store fallback
    const memUser = inMemoryUsers.get(normalizedEmail);
    if (!memUser) {
      throw new Error('Email atau password salah.');
    }

    const isMemPasswordValid = await comparePassword(password, memUser.password_hash);
    if (!isMemPasswordValid) {
      throw new Error('Email atau password salah.');
    }

    const token = generateToken({ id: memUser.id, email: memUser.email });
    return {
      user: {
        id: memUser.id,
        email: memUser.email,
        created_at: memUser.created_at
      },
      token
    };
  }

  /**
   * Retrieves current authenticated user profile by ID.
   */
  async getCurrentUser(userId: string): Promise<UserResponse | null> {
    try {
      const res = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1 LIMIT 1', [userId]);
      if (res.rows.length > 0) return res.rows[0];
    } catch (dbErr: any) {
      console.warn('[AuthService] PostgreSQL getCurrentUser failed:', dbErr.message);
    }

    for (const u of inMemoryUsers.values()) {
      if (u.id === userId) {
        return { id: u.id, email: u.email, created_at: u.created_at };
      }
    }

    return null;
  }
}

export const authService = new AuthService();
