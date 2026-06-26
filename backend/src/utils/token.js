const jwt = require('jsonwebtoken');

/**
 * Génère un jeton JWT signé contenant l'identifiant et le rôle de l'utilisateur.
 */
const genererToken = (utilisateur) => {
  return jwt.sign(
    { id: utilisateur.id, role: utilisateur.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

module.exports = { genererToken };
