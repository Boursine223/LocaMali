import app from '../../server/app';

// Explicit catch-all for /api/admin/* to ensure Vercel routes reach Express
export default function handler(req: any, res: any) {
  return app(req, res);
}
