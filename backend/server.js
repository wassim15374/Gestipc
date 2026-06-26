const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const { gestionErreurs, routeIntrouvable } = require('./src/middleware/errorHandler');

const app = express();

/* ----------------------------- Middlewares ----------------------------- */
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

/* ------------------------------- Routes -------------------------------- */
app.get('/', (req, res) => {
  res.json({ message: 'API GestiPC — Gestion de stock. Le serveur fonctionne.' });
});
app.use('/api', routes);

/* --------------------------- Gestion erreurs --------------------------- */
app.use(routeIntrouvable);
app.use(gestionErreurs);

/* ----------------------- Démarrage du serveur -------------------------- */
const PORT = process.env.PORT || 5000;

const demarrer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔ Connexion à la base de données réussie.');

    // Synchronise les modèles avec la base (création des tables si absentes)
    await sequelize.sync();
    console.log('✔ Modèles synchronisés.');

    app.listen(PORT, () => {
      console.log(`✔ Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Erreur] Impossible de démarrer le serveur :', err.message);
    process.exit(1);
  }
};

demarrer();

module.exports = app;
