/**
 * Gestionnaire d'erreurs centralisé. Capture les exceptions remontées par
 * les contrôleurs (via next(err)) et renvoie une réponse JSON homogène.
 */
const gestionErreurs = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[Erreur]', err.message);

  // Erreurs de validation ou de contrainte d'unicité Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Données invalides.',
      erreurs: err.errors.map((e) => e.message),
    });
  }

  const statut = err.statusCode || 500;
  res.status(statut).json({
    message: err.message || 'Erreur interne du serveur.',
  });
};

/**
 * Middleware déclenché lorsqu'aucune route ne correspond à l'URL demandée.
 */
const routeIntrouvable = (req, res) => {
  res.status(404).json({ message: `Route introuvable : ${req.originalUrl}` });
};

module.exports = { gestionErreurs, routeIntrouvable };
