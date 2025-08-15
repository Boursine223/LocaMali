import app from '../server/app';

// Catch-all for all /api/* routes on Vercel and delegate to Express
export default function handler(req: any, res: any) {
  return app(req, res);
}
