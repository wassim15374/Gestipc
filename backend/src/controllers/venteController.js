const {
  sequelize, Vente, LigneVente, Produit, Client,
  Utilisateur, MouvementStock,
} = require('../models');
const { genererReference } = require('../utils/reference');

/**
 * Contrôleur de gestion des ventes et factures.
 */

// GET /api/ventes
exports.lister = async (req, res, next) => {
  try {
    const ventes = await Vente.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['id', 'nom'] },
        { model: Utilisateur, as: 'utilisateur', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['date', 'DESC'], ['id', 'DESC']],
    });
    res.json(ventes);
  } catch (err) { next(err); }
};

// GET /api/ventes/:id — détail (sert aussi à imprimer la facture)
exports.recuperer = async (req, res, next) => {
  try {
    const vente = await Vente.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Utilisateur, as: 'utilisateur', attributes: ['id', 'nom', 'prenom'] },
        { model: LigneVente, as: 'lignes', include: [{ model: Produit, as: 'produit' }] },
      ],
    });
    if (!vente) return res.status(404).json({ message: 'Vente introuvable.' });
    res.json(vente);
  } catch (err) { next(err); }
};

// POST /api/ventes — enregistrer une vente
//   body : { clientId, date, lignes: [{ produitId, quantite, prixUnitaire, remise }] }
//   → contrôle de disponibilité, décrément du stock, mouvements de SORTIE
exports.creer = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { clientId, date, lignes } = req.body;
    if (!lignes || lignes.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'La vente doit contenir au moins une ligne.' });
    }

    // 1) Vérification de la disponibilité du stock pour chaque ligne
    for (const l of lignes) {
      const produit = await Produit.findByPk(l.produitId, { transaction: t });
      if (!produit) {
        await t.rollback();
        return res.status(404).json({ message: `Produit #${l.produitId} introuvable.` });
      }
      if (produit.quantiteStock < l.quantite) {
        await t.rollback();
        return res.status(400).json({
          message: `Stock insuffisant pour « ${produit.designation} » (disponible : ${produit.quantiteStock}).`,
        });
      }
    }

    // 2) Calcul du montant total (avec remise en %)
    const montantTotal = lignes.reduce((s, l) => {
      const remise = l.remise || 0;
      return s + l.quantite * l.prixUnitaire * (1 - remise / 100);
    }, 0);

    // 3) Création de la vente
    const compteur = await Vente.count({ transaction: t });
    const vente = await Vente.create({
      reference: genererReference('FAC', compteur),
      date: date || new Date(),
      clientId,
      utilisateurId: req.utilisateur.id,
      montantTotal,
      statut: 'payee',
    }, { transaction: t });

    // 4) Lignes + décrément du stock + mouvements de sortie
    for (const l of lignes) {
      await LigneVente.create({
        venteId: vente.id,
        produitId: l.produitId,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        remise: l.remise || 0,
      }, { transaction: t });

      const produit = await Produit.findByPk(l.produitId, { transaction: t });
      produit.quantiteStock -= l.quantite;
      await produit.save({ transaction: t });

      await MouvementStock.create({
        type: 'sortie',
        quantite: l.quantite,
        motif: `Vente ${vente.reference}`,
        produitId: produit.id,
        utilisateurId: req.utilisateur.id,
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json(vente);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
