const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Catégorie — regroupe les produits par famille
 * (Processeurs, Cartes graphiques, Mémoires, Stockage, Périphériques, ...).
 */
const Categorie = sequelize.define('Categorie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'categories',
});

module.exports = Categorie;
