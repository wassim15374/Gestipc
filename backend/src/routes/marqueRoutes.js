const express = require('express');
const router = express.Router();
const c = require('../controllers/marqueController');
const { proteger, autoriser } = require('../middleware/auth');

router.use(proteger);

router.get('/', c.lister);
router.post('/', autoriser('admin'), c.creer);
router.put('/:id', autoriser('admin'), c.modifier);
router.delete('/:id', autoriser('admin'), c.supprimer);

module.exports = router;
