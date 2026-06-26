const { Op } = require('sequelize');
const { Produit, Categorie, Marque, sequelize } = require('../models');

/**
 * Contrôleur de gestion des produits (articles).
 */

// GET /api/produits — liste avec recherche et filtres optionnels
//   ?recherche=texte   &categorie=ID   &marque=ID
exports.lister = async (req, res, next) => {
  try {
    const { recherche, categorie, marque } = req.query;
    const conditions = {};

    if (recherche) {
      conditions[Op.or] = [
        { reference: { [Op.like]: `%${recherche}%` } },
        { designation: { [Op.like]: `%${recherche}%` } },
      ];
    }
    if (categorie) conditions.categorieId = categorie;
    if (marque) conditions.marqueId = marque;

    const produits = await Produit.findAll({
      where: conditions,
      include: [
        { model: Categorie, as: 'categorie', attributes: ['id', 'nom'] },
        { model: Marque, as: 'marque', attributes: ['id', 'nom'] },
      ],
      order: [['designation', 'ASC']],
    });
    res.json(produits);
  } catch (err) { next(err); }
};

// GET /api/produits/alertes — produits dont le stock est <= seuil d'alerte
exports.alertes = async (req, res, next) => {
  try {
    const produits = await Produit.findAll({
      where: { quantiteStock: { [Op.lte]: sequelize.col('seuilAlerte') } },
      include: [{ model: Categorie, as: 'categorie', attributes: ['id', 'nom'] }],
      order: [['quantiteStock', 'ASC']],
    });
    res.json(produits);
  } catch (err) { next(err); }
};

// GET /api/produits/:id
exports.recuperer = async (req, res, next) => {
  try {
    const produit = await Produit.findByPk(req.params.id, {
      include: [
        { model: Categorie, as: 'categorie' },
        { model: Marque, as: 'marque' },
      ],
    });
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json(produit);
  } catch (err) { next(err); }
};

// POST /api/produits
exports.creer = async (req, res, next) => {
  try {
    const produit = await Produit.create(req.body);
    res.status(201).json(produit);
  } catch (err) { next(err); }
};

// PUT /api/produits/:id  (la quantité de stock n'est PAS modifiable ici :
//   elle est pilotée par les mouvements de stock pour garantir la traçabilité)
exports.modifier = async (req, res, next) => {
  try {
    const produit = await Produit.findByPk(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });

    const donnees = { ...req.body };
    delete donnees.quantiteStock;
    await produit.update(donnees);
    res.json(produit);
  } catch (err) { next(err); }
};

// DELETE /api/produits/:id
exports.supprimer = async (req, res, next) => {
  try {
    const produit = await Produit.findByPk(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
    await produit.destroy();
    res.json({ message: 'Produit supprimé.' });
  } catch (err) { next(err); }
};
