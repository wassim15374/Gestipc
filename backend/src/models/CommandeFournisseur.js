const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle CommandeFournisseur — commande d'approvisionnement passée auprès
 * d'un fournisseur. Tant qu'elle n'est pas « reçue », elle n'a aucun impact
 * sur le stock. Sa réception génère automatiquement les mouvements d'entrée.
 */
const CommandeFournisseur = sequelize.define('CommandeFournisseur', {
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
    type: DataTypes.ENUM('en_attente', 'recue', 'annulee'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
  montantTotal: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'commandes_fournisseur',
});

module.exports = CommandeFournisseur;
