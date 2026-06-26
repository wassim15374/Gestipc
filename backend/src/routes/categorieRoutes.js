const express = require('express');
const router = express.Router();
const c = require('../controllers/categorieController');
const { proteger, autoriser } = require('../middleware/auth');

router.use(proteger);

// Lecture : tous les rôles authentifiés
router.get('/', c.lister);
router.get('/:id', c.recuperer);

// Écriture : administrateur uniquement
router.post('/', autoriser('admin'), c.creer);
router.put('/:id', autoriser('admin'), c.modifier);
router.delete('/:id', autoriser('admin'), c.supprimer);

module.exports = router;
