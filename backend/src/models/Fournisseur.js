const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Fournisseur — entreprise auprès de laquelle le magasin
 * s'approvisionne en composants et accessoires.
 */
const Fournisseur = sequelize.define('Fournisseur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  contact: {
    type: DataTypes.STRING(80),
    allowNull: true,
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
  tableName: 'fournisseurs',
});

module.exports = Fournisseur;
