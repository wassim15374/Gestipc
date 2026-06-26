const express = require('express');
const router = express.Router();
const c = require('../controllers/produitController');
const { proteger, autoriser } = require('../middleware/auth');

router.use(proteger);

router.get('/', c.lister);
router.get('/alertes', c.alertes);        // doit précéder /:id
router.get('/:id', c.recuperer);

// Écriture : administrateur et magasinier
router.post('/', autoriser('admin', 'magasinier'), c.creer);
router.put('/:id', autoriser('admin', 'magasinier'), c.modifier);
router.delete('/:id', autoriser('admin'), c.supprimer);

module.exports = router;
