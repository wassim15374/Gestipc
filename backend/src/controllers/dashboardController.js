const { Op, fn, col, literal } = require('sequelize');
const {
  sequelize, Produit, Vente, Client, Fournisseur,
  CommandeFournisseur, MouvementStock, Categorie,
} = require('../models');

/**
 * Contrôleur du tableau de bord — agrège les indicateurs clés (KPI)
 * et les données nécessaires aux graphiques.
 */

// GET /api/dashboard/statistiques
exports.statistiques = async (req, res, next) => {
  try {
    const nbProduits = await Produit.count();
    const nbClients = await Client.count();
    const nbFournisseurs = await Fournisseur.count();
    const nbCommandesEnAttente = await CommandeFournisseur.count({ where: { statut: 'en_attente' } });

    // Valeur totale du stock (au prix d'achat) et au prix de vente
    const valeurs = await Produit.findAll({
      attributes: [
        [fn('SUM', literal('quantiteStock * prixAchat')), 'valeurAchat'],
        [fn('SUM', literal('quantiteStock * prixVente')), 'valeurVente'],
      ],
      raw: true,
    });

    // Produits sous le seuil d'alerte
    const nbAlertes = await Produit.count({
      where: { quantiteStock: { [Op.lte]: col('seuilAlerte') } },
    });

    // Chiffre d'affaires (ventes payées)
    const ca = await Vente.sum('montantTotal', { where: { statut: 'payee' } });

    res.json({
      nbProduits,
      nbClients,
      nbFournisseurs,
      nbCommandesEnAttente,
      nbAlertes,
      valeurStockAchat: Number(valeurs[0].valeurAchat) || 0,
      valeurStockVente: Number(valeurs[0].valeurVente) || 0,
      chiffreAffaires: Number(ca) || 0,
    });
  } catch (err) { next(err); }
};

// GET /api/dashboard/ventes-mensuelles — CA agrégé par mois (année courante)
exports.ventesMensuelles = async (req, res, next) => {
  try {
    const annee = new Date().getFullYear();
    const resultats = await Vente.findAll({
      attributes: [
        [fn('MONTH', col('date')), 'mois'],
        [fn('SUM', col('montantTotal')), 'total'],
      ],
      where: {
        statut: 'payee',
        [Op.and]: literal(`YEAR(date) = ${annee}`),
      },
      group: [fn('MONTH', col('date'))],
      order: [[literal('mois'), 'ASC']],
      raw: true,
    });

    const libelles = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const donnees = libelles.map((nom, i) => {
      const ligne = resultats.find((r) => Number(r.mois) === i + 1);
      return { mois: nom, total: ligne ? Number(ligne.total) : 0 };
    });
    res.json(donnees);
  } catch (err) { next(err); }
};

// GET /api/dashboard/repartition-categories — nombre de produits par catégorie
exports.repartitionCategories = async (req, res, next) => {
  try {
    const resultats = await Categorie.findAll({
      attributes: [
        'nom',
        [fn('COUNT', col('produits.id')), 'nombre'],
      ],
      include: [{ model: Produit, as: 'produits', attributes: [] }],
      group: ['Categorie.id'],
      raw: true,
    });
    res.json(resultats.map((r) => ({ categorie: r.nom, nombre: Number(r.nombre) })));
  } catch (err) { next(err); }
};
