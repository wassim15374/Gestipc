const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle LigneCommande — détaille un produit commandé au sein d'une
 * commande fournisseur (quantité et prix d'achat unitaire négocié).
 */
const LigneCommande = sequelize.define('LigneCommande', {
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
}, {
  tableName: 'lignes_commande',
});

module.exports = LigneCommande;
