const express = require('express');
const router = express.Router();
const c = require('../controllers/clientController');
const { proteger, autoriser } = require('../middleware/auth');

router.use(proteger);

router.get('/', c.lister);
router.get('/:id', c.recuperer);
router.post('/', autoriser('admin', 'magasinier'), c.creer);
router.put('/:id', autoriser('admin', 'magasinier'), c.modifier);
router.delete('/:id', autoriser('admin'), c.supprimer);

module.exports = router;
