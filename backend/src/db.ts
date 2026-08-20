import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let rawUrl = process.env.DATABASE_URL || '';
if (rawUrl.includes('@localhost')) {
  rawUrl = rawUrl.replace('@localhost', '@127.0.0.1');
}

export const pool = new Pool({
  connectionString: rawUrl,
});

pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Connection Warning]:', err.message);
});
