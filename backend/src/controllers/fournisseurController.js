const { Fournisseur } = require('../models');

/**
 * Contrôleur de gestion des fournisseurs.
 */

// GET /api/fournisseurs
exports.lister = async (req, res, next) => {
  try {
    const fournisseurs = await Fournisseur.findAll({ order: [['nom', 'ASC']] });
    res.json(fournisseurs);
  } catch (err) { next(err); }
};

// GET /api/fournisseurs/:id
exports.recuperer = async (req, res, next) => {
  try {
    const fournisseur = await Fournisseur.findByPk(req.params.id);
    if (!fournisseur) return res.status(404).json({ message: 'Fournisseur introuvable.' });
    res.json(fournisseur);
  } catch (err) { next(err); }
};

// POST /api/fournisseurs
exports.creer = async (req, res, next) => {
  try {
    const fournisseur = await Fournisseur.create(req.body);
    res.status(201).json(fournisseur);
  } catch (err) { next(err); }
};

// PUT /api/fournisseurs/:id
exports.modifier = async (req, res, next) => {
  try {
    const fournisseur = await Fournisseur.findByPk(req.params.id);
    if (!fournisseur) return res.status(404).json({ message: 'Fournisseur introuvable.' });
    await fournisseur.update(req.body);
    res.json(fournisseur);
  } catch (err) { next(err); }
};

// DELETE /api/fournisseurs/:id
exports.supprimer = async (req, res, next) => {
  try {
    const fournisseur = await Fournisseur.findByPk(req.params.id);
    if (!fournisseur) return res.status(404).json({ message: 'Fournisseur introuvable.' });
    await fournisseur.destroy();
    res.json({ message: 'Fournisseur supprimé.' });
  } catch (err) { next(err); }
};
