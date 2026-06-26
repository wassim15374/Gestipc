const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle LigneVente — détaille un produit vendu au sein d'une vente
 * (quantité, prix de vente unitaire et remise éventuelle en pourcentage).
 */
const LigneVente = sequelize.define('LigneVente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  prixUnitaire: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
  },
  remise: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'lignes_vente',
});

module.exports = LigneVente;
