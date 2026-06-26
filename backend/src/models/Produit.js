const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Produit (article) — composant ou accessoire informatique vendu
 * par le magasin. Le champ quantiteStock reflète l'état réel du stock et
 * n'est mis à jour qu'à travers les mouvements de stock (entrées/sorties).
 * seuilAlerte définit le niveau en dessous duquel le produit est signalé.
 */
const Produit = sequelize.define('Produit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reference: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
  },
  designation: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prixAchat: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
  },
  prixVente: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
  },
  quantiteStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  seuilAlerte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'produits',
});

module.exports = Produit;
