import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /api/public/localisation/:token
// Returns livreur info for a given link token (LienLocalisation.url)
const handleGetByToken = async (req: any, res: any) => {
  const { token } = req.params;
  const lien = await prisma.lienLocalisation.findUnique({
    where: { url: token },
    include: { livreur: { include: { vendeur: true } } },
  });
  if (!lien) return res.status(404).json({ error: 'Lien introuvable' });

  const livreur = lien.livreur;
  const vendeur = livreur?.vendeur;
  if (!vendeur) return res.status(404).json({ error: 'Vendeur introuvable' });

  const now = new Date();
  const debut = vendeur.dateDebut ? new Date(vendeur.dateDebut as any) : undefined;
  const fin = vendeur.dateFin ? new Date(vendeur.dateFin as any) : undefined;
  const withinDates = (!debut || now >= debut) && (!fin || now <= fin);
  const isActive = Boolean(vendeur.actif) && withinDates;
  if (!isActive) {
    const reason = !Boolean(vendeur.actif)
      ? 'inactive'
      : (!withinDates && fin && now > fin)
        ? 'expired'
        : 'not_started';
    return res.status(403).json({ error: 'Service indisponible', reason });
  }

  // Increment clicks for this link token
  await prisma.lienLocalisation.update({
    where: { id: lien.id },
    data: { clicks: { increment: 1 } },
  });

  return res.json({
    id: livreur.id,
    nom: livreur.nom,
    prenom: livreur.prenom,
    numeroWhatsApp: livreur.numeroWhatsApp,
    vendeur: {
      id: livreur.vendeur.id,
      nom: livreur.vendeur.nom,
      prenom: livreur.vendeur.prenom,
      actif: livreur.vendeur.actif,
      dateDebut: livreur.vendeur.dateDebut,
      dateFin: livreur.vendeur.dateFin,
    },
  });
};

// Existing route
router.get('/localisation/:token', handleGetByToken);
// Alias for spec compatibility
router.get('/lien/:token', handleGetByToken);

export default router;
