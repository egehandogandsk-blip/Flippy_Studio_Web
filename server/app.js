import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { createAuthMiddleware } from './auth.js';
import { initDatabase } from './db.js';
import { createAdminRouter } from './routes/admin.js';
import { createAuthRouter } from './routes/auth.js';
import { createFeedbackRouter } from './routes/feedback.js';
import { createPaymentsRouter } from './routes/payments.js';
import { createPublicRouter } from './routes/public.js';

export function createApp({ dbPath } = {}) {
  const db = initDatabase(dbPath);
  const authMiddleware = createAuthMiddleware(db);

  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(authMiddleware.attachUser);

  app.use('/api', createPublicRouter(db));
  app.use('/api/auth', createAuthRouter(db, authMiddleware));
  app.use('/api/payments', createPaymentsRouter(db, authMiddleware));
  app.use('/api/feedback', createFeedbackRouter(db, authMiddleware));
  app.use('/api/admin', createAdminRouter(db, authMiddleware));

  const distDir = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.use((err, _req, res, _next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return { app, db };
}
