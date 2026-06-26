const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle MouvementStock — trace toute variation du stock d'un produit.
 * Type « entree » (réception, ajustement positif) ou « sortie » (vente,
 * ajustement négatif). C'est l'historique qui garantit la traçabilité.
 */
const MouvementStock = sequelize.define('MouvementStock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  type: {
    type: DataTypes.ENUM('entree', 'sortie'),
    allowNull: false,
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  motif: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
}, {
  tableName: 'mouvements_stock',
});

module.exports = MouvementStock;
