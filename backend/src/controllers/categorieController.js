const { Categorie, Produit } = require('../models');

/**
 * Contrôleur de gestion des catégories de produits.
 */

// GET /api/categories
exports.lister = async (req, res, next) => {
  try {
    const categories = await Categorie.findAll({ order: [['nom', 'ASC']] });
    res.json(categories);
  } catch (err) { next(err); }
};

// GET /api/categories/:id
exports.recuperer = async (req, res, next) => {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie introuvable.' });
    res.json(categorie);
  } catch (err) { next(err); }
};

// POST /api/categories
exports.creer = async (req, res, next) => {
  try {
    const categorie = await Categorie.create({
      nom: req.body.nom,
      description: req.body.description,
    });
    res.status(201).json(categorie);
  } catch (err) { next(err); }
};

// PUT /api/categories/:id
exports.modifier = async (req, res, next) => {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie introuvable.' });
    categorie.nom = req.body.nom;
    categorie.description = req.body.description;
    await categorie.save();
    res.json(categorie);
  } catch (err) { next(err); }
};

// DELETE /api/categories/:id
exports.supprimer = async (req, res, next) => {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie introuvable.' });

    const nbProduits = await Produit.count({ where: { categorieId: categorie.id } });
    if (nbProduits > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer : des produits sont rattachés à cette catégorie.',
      });
    }
    await categorie.destroy();
    res.json({ message: 'Catégorie supprimée.' });
  } catch (err) { next(err); }
};
