const { Utilisateur } = require('../models');
const { genererToken } = require('../utils/token');

/**
 * Contrôleur d'authentification.
 */

// POST /api/auth/login — connexion d'un utilisateur
exports.connexion = async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur || !utilisateur.actif) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const motDePasseValide = await utilisateur.verifierMotDePasse(motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const token = genererToken(utilisateur);
    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profil — informations de l'utilisateur connecté
exports.profil = async (req, res) => {
  res.json(req.utilisateur);
};
