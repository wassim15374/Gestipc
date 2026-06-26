const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Client — personne physique ou morale qui achète des produits
 * au magasin. Sert à l'établissement des factures de vente.
 */
const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: true,
    validate: { isEmail: true },
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'clients',
});

module.exports = Client;
