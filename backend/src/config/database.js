const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Configuration de la connexion à la base de données MySQL via l'ORM Sequelize.
 * Les paramètres sont lus depuis le fichier .env afin de ne pas exposer
 * les informations sensibles dans le code source.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    define: {
      // Conserve les noms de tables tels que définis (pas de pluralisation automatique)
      freezeTableName: false,
      timestamps: true,
    },
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: { rejectUnauthorized: false },
    } : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
