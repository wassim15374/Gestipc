const sequelize = require('../config/database');

// Importation de tous les modèles
const Utilisateur = require('./Utilisateur');
const Categorie = require('./Categorie');
const Marque = require('./Marque');
const Produit = require('./Produit');
const Fournisseur = require('./Fournisseur');
const Client = require('./Client');
const CommandeFournisseur = require('./CommandeFournisseur');
const LigneCommande = require('./LigneCommande');
const Vente = require('./Vente');
const LigneVente = require('./LigneVente');
const MouvementStock = require('./MouvementStock');

/* =========================================================================
 *  DÉFINITION DES ASSOCIATIONS ENTRE LES ENTITÉS
 * ========================================================================= */

// --- Catégorie / Marque  →  Produit -------------------------------------
Categorie.hasMany(Produit, { foreignKey: 'categorieId', as: 'produits' });
Produit.belongsTo(Categorie, { foreignKey: 'categorieId', as: 'categorie' });

Marque.hasMany(Produit, { foreignKey: 'marqueId', as: 'produits' });
Produit.belongsTo(Marque, { foreignKey: 'marqueId', as: 'marque' });

// --- Fournisseur / Utilisateur  →  CommandeFournisseur ------------------
Fournisseur.hasMany(CommandeFournisseur, { foreignKey: 'fournisseurId', as: 'commandes' });
CommandeFournisseur.belongsTo(Fournisseur, { foreignKey: 'fournisseurId', as: 'fournisseur' });

Utilisateur.hasMany(CommandeFournisseur, { foreignKey: 'utilisateurId', as: 'commandes' });
CommandeFournisseur.belongsTo(Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });

// --- CommandeFournisseur  →  LigneCommande  ←  Produit ------------------
CommandeFournisseur.hasMany(LigneCommande, { foreignKey: 'commandeId', as: 'lignes', onDelete: 'CASCADE' });
LigneCommande.belongsTo(CommandeFournisseur, { foreignKey: 'commandeId', as: 'commande' });

Produit.hasMany(LigneCommande, { foreignKey: 'produitId', as: 'lignesCommande' });
LigneCommande.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });

// --- Client / Utilisateur  →  Vente -------------------------------------
Client.hasMany(Vente, { foreignKey: 'clientId', as: 'ventes' });
Vente.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Utilisateur.hasMany(Vente, { foreignKey: 'utilisateurId', as: 'ventes' });
Vente.belongsTo(Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });

// --- Vente  →  LigneVente  ←  Produit -----------------------------------
Vente.hasMany(LigneVente, { foreignKey: 'venteId', as: 'lignes', onDelete: 'CASCADE' });
LigneVente.belongsTo(Vente, { foreignKey: 'venteId', as: 'vente' });

Produit.hasMany(LigneVente, { foreignKey: 'produitId', as: 'lignesVente' });
LigneVente.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });

// --- Produit / Utilisateur  →  MouvementStock ---------------------------
Produit.hasMany(MouvementStock, { foreignKey: 'produitId', as: 'mouvements' });
MouvementStock.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });

Utilisateur.hasMany(MouvementStock, { foreignKey: 'utilisateurId', as: 'mouvements' });
MouvementStock.belongsTo(Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });

module.exports = {
  sequelize,
  Utilisateur,
  Categorie,
  Marque,
  Produit,
  Fournisseur,
  Client,
  CommandeFournisseur,
  LigneCommande,
  Vente,
  LigneVente,
  MouvementStock,
};
