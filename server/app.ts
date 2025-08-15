import express from 'express';
import cors from 'cors';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/admin', adminRouter);
// Alias without /admin prefix as requested
app.use('/api', adminRouter);
app.use('/api/public', publicRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;
