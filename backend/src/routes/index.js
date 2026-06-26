const express = require('express');
const router = express.Router();

/**
 * Point d'assemblage de toutes les routes de l'API.
 * Chaque ressource est montée sous son propre préfixe /api/...
 */
router.use('/auth', require('./authRoutes'));
router.use('/utilisateurs', require('./utilisateurRoutes'));
router.use('/categories', require('./categorieRoutes'));
router.use('/marques', require('./marqueRoutes'));
router.use('/produits', require('./produitRoutes'));
router.use('/fournisseurs', require('./fournisseurRoutes'));
router.use('/clients', require('./clientRoutes'));
router.use('/commandes', require('./commandeRoutes'));
router.use('/ventes', require('./venteRoutes'));
router.use('/mouvements', require('./mouvementRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));

module.exports = router;
