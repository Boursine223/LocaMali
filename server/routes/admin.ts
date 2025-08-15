import { Router } from 'express';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Shared login handler (DB first, fallback to ENV)
async function loginHandler(req: any, res: any) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return res.status(500).json({ error: 'JWT secret manquant' });

    // 1) Try DB-backed Admin first
    const admin = await prisma.admin.findUnique({ where: { email } }).catch(() => null);
    if (admin) {
      const ok = await bcrypt.compare(password, admin.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
      const token = jwt.sign({ email: admin.email }, jwtSecret, { expiresIn: '30d' });
      return res.json({ token, source: 'db' });
    }

    // 2) Fallback to ENV admin (backward compatibility)
    const envEmail = process.env.ADMIN_EMAIL;
    const envHash = process.env.ADMIN_PASSWORD_HASH;
    if (!envEmail || !envHash) return res.status(401).json({ error: 'Identifiants invalides' });
    if (email !== envEmail) return res.status(401).json({ error: 'Identifiants invalides' });
    const ok = await bcrypt.compare(password, envHash);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
    const token = jwt.sign({ email: envEmail }, jwtSecret, { expiresIn: '30d' });
    return res.json({ token, source: 'env' });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// POST /api/login and /api/connexion (plus their /api/admin/* aliases)
router.post('/login', loginHandler);
router.post('/connexion', loginHandler);

// Vendeurs CRUD
router.get('/vendeurs', requireAdmin, async (_req, res) => {
  const vendeurs = await prisma.vendeur.findMany({ include: { livreurs: { include: { lienLocalisation: true } } } });
  res.json(vendeurs);
});

router.post('/vendeurs', requireAdmin, async (req, res) => {
  const { nom, prenom, email, password, dateDebut, dateFin, actif } = req.body as any;
  const passwordHash = await bcrypt.hash(password, 10);
  const vendeur = await prisma.vendeur.create({
    data: {
      nom,
      prenom,
      email,
      passwordHash,
      dateDebut: new Date(dateDebut),
      dateFin: dateFin ? new Date(dateFin) : null,
      actif: actif ?? true,
    },
  });
  res.status(201).json(vendeur);
});

router.put('/vendeurs/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { nom, prenom, email, password, dateDebut, dateFin, actif } = req.body as any;
  let passwordHash: string | undefined;
  if (password) passwordHash = await bcrypt.hash(password, 10);

  const vendeur = await prisma.vendeur.update({
    where: { id },
    data: {
      nom,
      prenom,
      email,
      ...(passwordHash ? { passwordHash } : {}),
      ...(dateDebut ? { dateDebut: new Date(dateDebut) } : {}),
      ...(dateFin !== undefined ? { dateFin: dateFin ? new Date(dateFin) : null } : {}),
      ...(actif !== undefined ? { actif } : {}),
    },
  });
  res.json(vendeur);
});

router.delete('/vendeurs/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.vendeur.delete({ where: { id } });
  res.status(204).send();
});

// Livreurs CRUD
router.get('/livreurs', requireAdmin, async (_req, res) => {
  const livreurs = await prisma.livreur.findMany({ include: { vendeur: true, lienLocalisation: true } });
  res.json(livreurs);
});

router.post('/livreurs', requireAdmin, async (req, res) => {
  const { nom, prenom, numeroWhatsApp, vendeurId } = req.body as any;
  const livreur = await prisma.livreur.create({ data: { nom, prenom, numeroWhatsApp, vendeurId: Number(vendeurId) } });
  // Auto-create link with UUID token
  const token = randomUUID();
  const lien = await prisma.lienLocalisation.create({ data: { livreurId: livreur.id, url: token } });
  res.status(201).json({ ...livreur, lienLocalisation: lien });
});

router.put('/livreurs/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { nom, prenom, numeroWhatsApp, vendeurId } = req.body as any;
  const livreur = await prisma.livreur.update({
    where: { id },
    data: {
      ...(nom !== undefined ? { nom } : {}),
      ...(prenom !== undefined ? { prenom } : {}),
      ...(numeroWhatsApp !== undefined ? { numeroWhatsApp } : {}),
      ...(vendeurId !== undefined ? { vendeurId: Number(vendeurId) } : {}),
    },
  });
  res.json(livreur);
});

router.delete('/livreurs/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.livreur.delete({ where: { id } });
  res.status(204).send();
});

// Liens

router.get('/liens', requireAdmin, async (_req, res) => {
  const liens = await prisma.lienLocalisation.findMany({ include: { livreur: true } });
  res.json(liens);
});

router.post('/liens', requireAdmin, async (req, res) => {
  const { livreurId } = req.body as any;
  const token = randomUUID();
  const id = Number(livreurId);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ error: 'livreurId invalide' });
  }
  // Prevent duplicate link per livreur (unique constraint on livreurId)
  const existing = await prisma.lienLocalisation.findFirst({ where: { livreurId: id } });
  if (existing) {
    return res.status(409).json({
      error: 'Un lien existe déjà pour ce livreur. Utilisez /api/admin/livreurs/:id/regenerate-link pour régénérer le lien.',
      lien: existing,
    });
  }
  const lien = await prisma.lienLocalisation.create({ data: { livreurId: id, url: token } });
  res.status(201).json(lien);
});

// Regenerate a livreur link (creates new token; deletes old if exists)
router.post('/livreurs/:id/regenerate-link', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.lienLocalisation.findFirst({ where: { livreurId: id } });
  if (existing) {
    await prisma.lienLocalisation.delete({ where: { id: existing.id } });
  }
  const token = randomUUID();
  const lien = await prisma.lienLocalisation.create({ data: { livreurId: id, url: token } });
  res.json(lien);
});

router.delete('/liens/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.lienLocalisation.delete({ where: { id } });
  res.status(204).send();
});

export default router;
