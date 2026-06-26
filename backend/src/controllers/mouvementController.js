const { sequelize, MouvementStock, Produit, Utilisateur } = require('../models');

/**
 * Contrôleur de gestion des mouvements de stock (historique + ajustement manuel).
 */

// GET /api/mouvements — historique (filtre optionnel ?produit=ID & type=entree|sortie)
exports.lister = async (req, res, next) => {
  try {
    const { produit, type } = req.query;
    const conditions = {};
    if (produit) conditions.produitId = produit;
    if (type) conditions.type = type;

    const mouvements = await MouvementStock.findAll({
      where: conditions,
      include: [
        { model: Produit, as: 'produit', attributes: ['id', 'reference', 'designation'] },
        { model: Utilisateur, as: 'utilisateur', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['date', 'DESC'], ['id', 'DESC']],
      limit: 200,
    });
    res.json(mouvements);
  } catch (err) { next(err); }
};

// POST /api/mouvements — ajustement manuel d'inventaire
//   body : { produitId, type: 'entree'|'sortie', quantite, motif }
exports.ajuster = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { produitId, type, quantite, motif } = req.body;
    const produit = await Produit.findByPk(produitId, { transaction: t });
    if (!produit) {
      await t.rollback();
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    if (type === 'sortie' && produit.quantiteStock < quantite) {
      await t.rollback();
      return res.status(400).json({ message: 'Stock insuffisant pour cette sortie.' });
    }

    produit.quantiteStock += (type === 'entree' ? quantite : -quantite);
    await produit.save({ transaction: t });

    const mouvement = await MouvementStock.create({
      type,
      quantite,
      motif: motif || 'Ajustement d\'inventaire',
      produitId,
      utilisateurId: req.utilisateur.id,
    }, { transaction: t });

    await t.commit();
    res.status(201).json(mouvement);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
