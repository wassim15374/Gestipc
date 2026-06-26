const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { proteger } = require('../middleware/auth');

router.post('/login', authController.connexion);
router.get('/profil', proteger, authController.profil);

module.exports = router;
