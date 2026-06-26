const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Marque — fabricant d'un produit (Intel, AMD, Asus, Corsair, ...).
 */
const Marque = sequelize.define('Marque', {
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
}, {
  tableName: 'marques',
});

module.exports = Marque;
