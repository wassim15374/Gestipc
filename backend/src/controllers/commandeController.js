const {
  sequelize, CommandeFournisseur, LigneCommande, Produit,
  Fournisseur, Utilisateur, MouvementStock,
} = require('../models');
const { genererReference } = require('../utils/reference');

/**
 * Contrôleur de gestion des commandes fournisseurs (approvisionnement).
 */

// GET /api/commandes
exports.lister = async (req, res, next) => {
  try {
    const commandes = await CommandeFournisseur.findAll({
      include: [
        { model: Fournisseur, as: 'fournisseur', attributes: ['id', 'nom'] },
        { model: Utilisateur, as: 'utilisateur', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['date', 'DESC'], ['id', 'DESC']],
    });
    res.json(commandes);
  } catch (err) { next(err); }
};

// GET /api/commandes/:id — détail avec les lignes
exports.recuperer = async (req, res, next) => {
  try {
    const commande = await CommandeFournisseur.findByPk(req.params.id, {
      include: [
        { model: Fournisseur, as: 'fournisseur' },
        { model: Utilisateur, as: 'utilisateur', attributes: ['id', 'nom', 'prenom'] },
        { model: LigneCommande, as: 'lignes', include: [{ model: Produit, as: 'produit' }] },
      ],
    });
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
    res.json(commande);
  } catch (err) { next(err); }
};

// POST /api/commandes — création (statut « en_attente », sans impact stock)
//   body : { fournisseurId, date, lignes: [{ produitId, quantite, prixUnitaire }] }
exports.creer = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { fournisseurId, date, lignes } = req.body;
    if (!lignes || lignes.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'La commande doit contenir au moins une ligne.' });
    }

    const compteur = await CommandeFournisseur.count({ transaction: t });
    const montantTotal = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);

    const commande = await CommandeFournisseur.create({
      reference: genererReference('CMD', compteur),
      date: date || new Date(),
      fournisseurId,
      utilisateurId: req.utilisateur.id,
      montantTotal,
      statut: 'en_attente',
    }, { transaction: t });

    for (const l of lignes) {
      await LigneCommande.create({
        commandeId: commande.id,
        produitId: l.produitId,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json(commande);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// PUT /api/commandes/:id/reception — réception de la commande
//   → pour chaque ligne : mouvement d'ENTRÉE + incrément du stock produit
exports.receptionner = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const commande = await CommandeFournisseur.findByPk(req.params.id, {
      include: [{ model: LigneCommande, as: 'lignes' }],
      transaction: t,
    });
    if (!commande) {
      await t.rollback();
      return res.status(404).json({ message: 'Commande introuvable.' });
    }
    if (commande.statut !== 'en_attente') {
      await t.rollback();
      return res.status(400).json({ message: 'Seule une commande en attente peut être réceptionnée.' });
    }

    for (const ligne of commande.lignes) {
      const produit = await Produit.findByPk(ligne.produitId, { transaction: t });
      produit.quantiteStock += ligne.quantite;
      await produit.save({ transaction: t });

      await MouvementStock.create({
        type: 'entree',
        quantite: ligne.quantite,
        motif: `Réception commande ${commande.reference}`,
        produitId: produit.id,
        utilisateurId: req.utilisateur.id,
      }, { transaction: t });
    }

    commande.statut = 'recue';
    await commande.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Commande réceptionnée, stock mis à jour.', commande });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// PUT /api/commandes/:id/annuler
exports.annuler = async (req, res, next) => {
  try {
    const commande = await CommandeFournisseur.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
    if (commande.statut === 'recue') {
      return res.status(400).json({ message: 'Une commande déjà reçue ne peut être annulée.' });
    }
    commande.statut = 'annulee';
    await commande.save();
    res.json({ message: 'Commande annulée.', commande });
  } catch (err) { next(err); }
};
