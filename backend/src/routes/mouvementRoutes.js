const express = require('express');
const router = express.Router();
const c = require('../controllers/mouvementController');
const { proteger, autoriser } = require('../middleware/auth');

router.use(proteger);

router.get('/', c.lister);
router.post('/', autoriser('admin', 'magasinier'), c.ajuster);

module.exports = router;
