import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: { email: string };
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const cookieToken = (req as any).cookies?.['admin_session'];
  let token = cookieToken;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
  }
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
    req.admin = { email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
