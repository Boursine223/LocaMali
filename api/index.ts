import app from '../server/app';

// Vercel Node function entry: delegate to Express app
export default function handler(req: any, res: any) {
  return app(req, res);
}
