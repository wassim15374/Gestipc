const express = require('express');
const router = express.Router();
const c = require('../controllers/utilisateurController');
const { proteger, autoriser } = require('../middleware/auth');

// Toutes les opérations sur les utilisateurs sont réservées à l'administrateur
router.use(proteger, autoriser('admin'));

router.get('/', c.lister);
router.get('/:id', c.recuperer);
router.post('/', c.creer);
router.put('/:id', c.modifier);
router.delete('/:id', c.supprimer);

module.exports = router;
