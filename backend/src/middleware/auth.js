const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

/**
 * Middleware d'authentification : vérifie la présence et la validité du
 * jeton JWT envoyé dans l'en-tête « Authorization: Bearer <token> ».
 * En cas de succès, l'utilisateur courant est attaché à la requête (req.utilisateur).
 */
const proteger = async (req, res, next) => {
  try {
    const entete = req.headers.authorization;
    if (!entete || !entete.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Accès refusé : jeton manquant." });
    }

    const token = entete.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const utilisateur = await Utilisateur.findByPk(decode.id, {
      attributes: { exclude: ['motDePasse'] },
    });

    if (!utilisateur || !utilisateur.actif) {
      return res.status(401).json({ message: "Utilisateur invalide ou désactivé." });
    }

    req.utilisateur = utilisateur;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Jeton invalide ou expiré." });
  }
};

/**
 * Middleware d'autorisation par rôle : à utiliser après « proteger ».
 * Exemple : autoriser('admin', 'gerant')
 */
const autoriser = (...roles) => {
  return (req, res, next) => {
    if (!req.utilisateur || !roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        message: "Vous n'avez pas les droits nécessaires pour cette action.",
      });
    }
    next();
  };
};

module.exports = { proteger, autoriser };
