const express = require('express');
const router = express.Router();
const c = require('../controllers/commandeController');
const { proteger, autoriser } = require('../middleware/auth');

router.use(proteger);

router.get('/', c.lister);
router.get('/:id', c.recuperer);
router.post('/', autoriser('admin', 'magasinier'), c.creer);
router.put('/:id/reception', autoriser('admin', 'magasinier'), c.receptionner);
router.put('/:id/annuler', autoriser('admin', 'magasinier'), c.annuler);

module.exports = router;
