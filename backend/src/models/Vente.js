const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Vente (facture) — opération de vente à un client. Sa validation
 * décrémente le stock via des mouvements de sortie et produit une facture.
 */
const Vente = sequelize.define('Vente', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  statut: {
    type: DataTypes.ENUM('payee', 'en_attente', 'annulee'),
    allowNull: false,
    defaultValue: 'payee',
  },
  montantTotal: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'ventes',
});

module.exports = Vente;
