const { Marque, Produit } = require('../models');

/**
 * Contrôleur de gestion des marques (fabricants).
 */

// GET /api/marques
exports.lister = async (req, res, next) => {
  try {
    const marques = await Marque.findAll({ order: [['nom', 'ASC']] });
    res.json(marques);
  } catch (err) { next(err); }
};

// POST /api/marques
exports.creer = async (req, res, next) => {
  try {
    const marque = await Marque.create({ nom: req.body.nom });
    res.status(201).json(marque);
  } catch (err) { next(err); }
};

// PUT /api/marques/:id
exports.modifier = async (req, res, next) => {
  try {
    const marque = await Marque.findByPk(req.params.id);
    if (!marque) return res.status(404).json({ message: 'Marque introuvable.' });
    marque.nom = req.body.nom;
    await marque.save();
    res.json(marque);
  } catch (err) { next(err); }
};

// DELETE /api/marques/:id
exports.supprimer = async (req, res, next) => {
  try {
    const marque = await Marque.findByPk(req.params.id);
    if (!marque) return res.status(404).json({ message: 'Marque introuvable.' });

    const nbProduits = await Produit.count({ where: { marqueId: marque.id } });
    if (nbProduits > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer : des produits sont rattachés à cette marque.',
      });
    }
    await marque.destroy();
    res.json({ message: 'Marque supprimée.' });
  } catch (err) { next(err); }
};
