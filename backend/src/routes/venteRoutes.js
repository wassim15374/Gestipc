const express = require('express');
const router = express.Router();
const c = require('../controllers/venteController');
const { proteger, autoriser } = require('../middleware/auth');

router.use(proteger);

router.get('/', c.lister);
router.get('/:id', c.recuperer);
router.post('/', autoriser('admin', 'magasinier'), c.creer);

module.exports = router;
