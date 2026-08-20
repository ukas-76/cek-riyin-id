process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.PRISMA_CLI_QUERY_ENGINE_TYPE = 'binary';

import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import checkRoutes from './routes/checkRoutes';
import authRoutes from './routes/authRoutes';
import savedNumberRoutes from './routes/savedNumberRoutes';
import commentRoutes from './routes/commentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://cekriyin.id', 'https://www.cekriyin.id', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.text({ type: 'application/json' }));
app.use((req, _res, next) => {
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      let cleanBody = req.body.trim();
      if (cleanBody.includes('\\"')) {
        cleanBody = cleanBody.replace(/\\"/g, '"');
      }
      req.body = JSON.parse(cleanBody);
    } catch (e) {
      // Keep req.body as is if JSON.parse fails
    }
  }
  next();
});
app.use(cookieParser());

// Routes
app.use('/api/check', checkRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/saved-numbers', savedNumberRoutes);
app.use('/api/comments', commentRoutes);

// GET /api/health - Backend health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'cekriyin-backend',
    version: '1.0.0'
  });
});

// Global Error Handler (Ensures all errors return JSON instead of HTML)
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[Global Error Handler]:', err);
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    error: err.message || 'Terjadi kesalahan pada server.'
  });
});

app.listen(PORT, () => {
  console.log(`[Cekriyin Backend] Server running on http://localhost:${PORT}`);
});

export default app;
