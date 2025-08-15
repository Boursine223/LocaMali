import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';

const router = Router();

const COOKIE_NAME = 'admin_session';
const isProd = process.env.NODE_ENV === 'production';

function setSessionCookie(res: any, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'lax' : 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

router.post('/session', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return res.status(500).json({ error: 'JWT secret manquant' });

    // Try DB admin
    const admin = await prisma.admin.findUnique({ where: { email } }).catch(() => null);
    if (admin) {
      const ok = await bcrypt.compare(password, admin.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
      const token = jwt.sign({ email: admin.email }, jwtSecret, { expiresIn: '30d' });
      setSessionCookie(res, token);
      return res.json({ ok: true });
    }

    // Fallback to ENV admin
    const envEmail = process.env.ADMIN_EMAIL;
    const envHash = process.env.ADMIN_PASSWORD_HASH;
    if (!envEmail || !envHash) return res.status(401).json({ error: 'Identifiants invalides' });
    if (email !== envEmail) return res.status(401).json({ error: 'Identifiants invalides' });
    const ok = await bcrypt.compare(password, envHash);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
    const token = jwt.sign({ email: envEmail }, jwtSecret, { expiresIn: '30d' });
    setSessionCookie(res, token);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Session login error', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/session', (req: any, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
    return res.json({ email: payload.email });
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

router.delete('/session', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.status(204).send();
});

export default router;
