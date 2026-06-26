const express = require('express');
const router = express.Router();
const c = require('../controllers/dashboardController');
const { proteger } = require('../middleware/auth');

router.use(proteger);

router.get('/statistiques', c.statistiques);
router.get('/ventes-mensuelles', c.ventesMensuelles);
router.get('/repartition-categories', c.repartitionCategories);

module.exports = router;
