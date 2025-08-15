import express from 'express';
import cors from 'cors';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';
import cookieParser from 'cookie-parser';
import sessionRouter from './routes/session';

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Simple diagnostics endpoint to help debug production issues without exposing secrets
app.get('/api/diag', (_req, res) => {
  res.json({
    ok: true,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD_HASH: !!process.env.ADMIN_PASSWORD_HASH,
      JWT_SECRET: !!process.env.JWT_SECRET,
      CORS_ORIGIN: process.env.CORS_ORIGIN ? true : false,
      NODE_ENV: process.env.NODE_ENV || 'unknown',
    }
  });
});

// Routes with /api prefix (local dev: baseURL http://localhost:4000/api)
app.use('/api/admin', adminRouter);
app.use('/api/public', publicRouter);
app.use('/api', sessionRouter);

// Mirror routes WITHOUT /api prefix (Vercel: function mounted at /api forwards '/admin/*')
app.use('/admin', adminRouter);
app.use('/public', publicRouter);
app.use('/', sessionRouter);

// Also mirror health/diag without prefix for convenience in Vercel
app.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/diag', (_req, res) => {
  res.json({
    ok: true,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD_HASH: !!process.env.ADMIN_PASSWORD_HASH,
      JWT_SECRET: !!process.env.JWT_SECRET,
      CORS_ORIGIN: process.env.CORS_ORIGIN ? true : false,
      NODE_ENV: process.env.NODE_ENV || 'unknown',
    }
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;
