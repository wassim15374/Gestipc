const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

/**
 * Modèle Utilisateur — représente une personne pouvant se connecter à
 * l'application. Trois rôles sont gérés : administrateur, magasinier et gérant.
 * Le mot de passe est automatiquement haché (bcrypt) avant tout enregistrement.
 */
const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  motDePasse: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'magasinier', 'gerant'),
    allowNull: false,
    defaultValue: 'magasinier',
  },
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'utilisateurs',
  hooks: {
    beforeSave: async (utilisateur) => {
      if (utilisateur.changed('motDePasse')) {
        const sel = await bcrypt.genSalt(10);
        utilisateur.motDePasse = await bcrypt.hash(utilisateur.motDePasse, sel);
      }
    },
  },
});

/**
 * Compare un mot de passe en clair avec le mot de passe haché stocké.
 */
Utilisateur.prototype.verifierMotDePasse = function (motDePasseClair) {
  return bcrypt.compare(motDePasseClair, this.motDePasse);
};

module.exports = Utilisateur;
