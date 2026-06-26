/**
 * Script de peuplement de la base de données GestiPC.
 *  - crée la base de données si elle n'existe pas ;
 *  - (re)crée toutes les tables (sync force) ;
 *  - insère un jeu de données de démonstration réaliste
 *    (composants et accessoires informatiques, prix en dinars tunisiens).
 *
 *  Exécution :  npm run seed
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const {
  sequelize, Utilisateur, Categorie, Marque, Produit, Fournisseur,
  Client, CommandeFournisseur, LigneCommande, Vente, LigneVente, MouvementStock,
} = require('../models');

async function creerBaseSiAbsente() {
  const connexion = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await connexion.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connexion.end();
}

async function seed() {
  try {
    await creerBaseSiAbsente();
    await sequelize.sync({ force: true });
    console.log('✔ Base et tables recréées.');

    /* ----------------------------- Utilisateurs ----------------------------- */
    await Utilisateur.bulkCreate([
      { nom: 'Arous', prenom: 'Wassim', email: 'admin@gestipc.tn', motDePasse: 'admin123', role: 'admin' },
      { nom: 'Ben Salah', prenom: 'Khaled', email: 'magasinier@gestipc.tn', motDePasse: 'magasin123', role: 'magasinier' },
      { nom: 'Trabelsi', prenom: 'Sonia', email: 'gerant@gestipc.tn', motDePasse: 'gerant123', role: 'gerant' },
    ], { individualHooks: true });
    console.log('✔ Utilisateurs insérés.');

    /* ------------------------------ Catégories ------------------------------ */
    const categories = await Categorie.bulkCreate([
      { nom: 'Processeurs', description: 'Unités centrales de traitement (CPU)' },
      { nom: 'Cartes graphiques', description: 'Cartes graphiques dédiées (GPU)' },
      { nom: 'Mémoires RAM', description: 'Barrettes de mémoire vive' },
      { nom: 'Stockage', description: 'Disques durs, SSD et NVMe' },
      { nom: 'Cartes mères', description: 'Cartes mères ATX / micro-ATX' },
      { nom: 'Alimentations', description: "Blocs d'alimentation" },
      { nom: 'Boîtiers', description: "Boîtiers PC" },
      { nom: 'Refroidissement', description: 'Ventirads et watercooling' },
      { nom: 'Périphériques', description: 'Souris, claviers, casques' },
      { nom: 'Écrans', description: "Moniteurs et écrans" },
      { nom: 'Accessoires', description: 'Câbles, clés USB, webcams' },
    ]);
    const cat = {};
    categories.forEach((c) => { cat[c.nom] = c.id; });

    /* -------------------------------- Marques ------------------------------- */
    const marques = await Marque.bulkCreate([
      { nom: 'Intel' }, { nom: 'AMD' }, { nom: 'NVIDIA' }, { nom: 'Asus' },
      { nom: 'MSI' }, { nom: 'Gigabyte' }, { nom: 'Corsair' }, { nom: 'Kingston' },
      { nom: 'Samsung' }, { nom: 'Seagate' }, { nom: 'Logitech' },
      { nom: 'Cooler Master' }, { nom: 'NZXT' }, { nom: 'LG' },
      { nom: 'Redragon' }, { nom: 'HyperX' },
    ]);
    const mq = {};
    marques.forEach((m) => { mq[m.nom] = m.id; });

    /* ------------------------------- Produits ------------------------------- */
    const produits = await Produit.bulkCreate([
      // Processeurs
      { reference: 'CPU-001', designation: 'Intel Core i5-13400F', prixAchat: 520, prixVente: 599, quantiteStock: 12, seuilAlerte: 4, categorieId: cat['Processeurs'], marqueId: mq['Intel'] },
      { reference: 'CPU-002', designation: 'Intel Core i7-13700K', prixAchat: 1100, prixVente: 1290, quantiteStock: 6, seuilAlerte: 3, categorieId: cat['Processeurs'], marqueId: mq['Intel'] },
      { reference: 'CPU-003', designation: 'AMD Ryzen 5 5600X', prixAchat: 540, prixVente: 629, quantiteStock: 3, seuilAlerte: 4, categorieId: cat['Processeurs'], marqueId: mq['AMD'] },
      { reference: 'CPU-004', designation: 'AMD Ryzen 7 7800X3D', prixAchat: 1350, prixVente: 1590, quantiteStock: 5, seuilAlerte: 3, categorieId: cat['Processeurs'], marqueId: mq['AMD'] },
      // Cartes graphiques
      { reference: 'GPU-001', designation: 'Asus RTX 4060 Dual 8GB', prixAchat: 1150, prixVente: 1349, quantiteStock: 7, seuilAlerte: 3, categorieId: cat['Cartes graphiques'], marqueId: mq['Asus'] },
      { reference: 'GPU-002', designation: 'MSI RTX 4070 Ventus 12GB', prixAchat: 1900, prixVente: 2250, quantiteStock: 2, seuilAlerte: 2, categorieId: cat['Cartes graphiques'], marqueId: mq['MSI'] },
      { reference: 'GPU-003', designation: 'Gigabyte RX 6700 XT 12GB', prixAchat: 1350, prixVente: 1599, quantiteStock: 4, seuilAlerte: 2, categorieId: cat['Cartes graphiques'], marqueId: mq['Gigabyte'] },
      // Mémoires RAM
      { reference: 'RAM-001', designation: 'Corsair Vengeance 16GB DDR4 3200', prixAchat: 160, prixVente: 199, quantiteStock: 20, seuilAlerte: 6, categorieId: cat['Mémoires RAM'], marqueId: mq['Corsair'] },
      { reference: 'RAM-002', designation: 'Kingston Fury 32GB DDR5 5600', prixAchat: 360, prixVente: 429, quantiteStock: 9, seuilAlerte: 4, categorieId: cat['Mémoires RAM'], marqueId: mq['Kingston'] },
      // Stockage
      { reference: 'SSD-001', designation: 'Samsung 980 NVMe 1TB', prixAchat: 230, prixVente: 279, quantiteStock: 15, seuilAlerte: 5, categorieId: cat['Stockage'], marqueId: mq['Samsung'] },
      { reference: 'SSD-002', designation: 'Kingston A400 SSD 480GB', prixAchat: 110, prixVente: 139, quantiteStock: 25, seuilAlerte: 8, categorieId: cat['Stockage'], marqueId: mq['Kingston'] },
      { reference: 'HDD-001', designation: 'Seagate Barracuda 2TB', prixAchat: 180, prixVente: 219, quantiteStock: 10, seuilAlerte: 4, categorieId: cat['Stockage'], marqueId: mq['Seagate'] },
      // Cartes mères
      { reference: 'MB-001', designation: 'Asus TUF B550-PLUS', prixAchat: 380, prixVente: 459, quantiteStock: 6, seuilAlerte: 3, categorieId: cat['Cartes mères'], marqueId: mq['Asus'] },
      { reference: 'MB-002', designation: 'MSI PRO B760M', prixAchat: 340, prixVente: 399, quantiteStock: 8, seuilAlerte: 3, categorieId: cat['Cartes mères'], marqueId: mq['MSI'] },
      // Alimentations
      { reference: 'PSU-001', designation: 'Corsair RM750 80+ Gold', prixAchat: 290, prixVente: 349, quantiteStock: 11, seuilAlerte: 4, categorieId: cat['Alimentations'], marqueId: mq['Corsair'] },
      { reference: 'PSU-002', designation: 'Cooler Master MWE 600W', prixAchat: 150, prixVente: 189, quantiteStock: 2, seuilAlerte: 4, categorieId: cat['Alimentations'], marqueId: mq['Cooler Master'] },
      // Boîtiers
      { reference: 'CASE-001', designation: 'NZXT H510 Noir', prixAchat: 250, prixVente: 299, quantiteStock: 5, seuilAlerte: 2, categorieId: cat['Boîtiers'], marqueId: mq['NZXT'] },
      // Refroidissement
      { reference: 'COOL-001', designation: 'Cooler Master Hyper 212', prixAchat: 95, prixVente: 129, quantiteStock: 14, seuilAlerte: 5, categorieId: cat['Refroidissement'], marqueId: mq['Cooler Master'] },
      // Périphériques
      { reference: 'PER-001', designation: 'Souris Logitech G502 Hero', prixAchat: 130, prixVente: 169, quantiteStock: 18, seuilAlerte: 6, categorieId: cat['Périphériques'], marqueId: mq['Logitech'] },
      { reference: 'PER-002', designation: 'Clavier Redragon Kumara RGB', prixAchat: 95, prixVente: 129, quantiteStock: 16, seuilAlerte: 6, categorieId: cat['Périphériques'], marqueId: mq['Redragon'] },
      { reference: 'PER-003', designation: 'Casque HyperX Cloud II', prixAchat: 200, prixVente: 249, quantiteStock: 1, seuilAlerte: 4, categorieId: cat['Périphériques'], marqueId: mq['HyperX'] },
      // Écrans
      { reference: 'MON-001', designation: 'Samsung Odyssey 24" 144Hz', prixAchat: 450, prixVente: 549, quantiteStock: 7, seuilAlerte: 3, categorieId: cat['Écrans'], marqueId: mq['Samsung'] },
      { reference: 'MON-002', designation: 'LG UltraGear 27" QHD', prixAchat: 720, prixVente: 849, quantiteStock: 4, seuilAlerte: 2, categorieId: cat['Écrans'], marqueId: mq['LG'] },
      // Accessoires
      { reference: 'ACC-001', designation: 'Câble HDMI 2.1 2m', prixAchat: 18, prixVente: 29, quantiteStock: 40, seuilAlerte: 10, categorieId: cat['Accessoires'], marqueId: mq['Logitech'] },
      { reference: 'ACC-002', designation: 'Clé USB Kingston 64GB', prixAchat: 22, prixVente: 35, quantiteStock: 30, seuilAlerte: 10, categorieId: cat['Accessoires'], marqueId: mq['Kingston'] },
    ]);
    console.log(`✔ ${produits.length} produits insérés.`);

    /* ------------------------------ Fournisseurs ---------------------------- */
    const fournisseurs = await Fournisseur.bulkCreate([
      { nom: 'Tunisianet', contact: 'Service achats', telephone: '71 100 200', email: 'contact@tunisianet.tn', adresse: 'Rue du Lac, Tunis' },
      { nom: 'Mytek', contact: 'Direction commerciale', telephone: '70 250 300', email: 'pro@mytek.tn', adresse: 'Avenue Habib Bourguiba, Ariana' },
      { nom: 'SBS Informatique', contact: 'Mohamed Gharbi', telephone: '74 410 500', email: 'achat@sbs.tn', adresse: 'Route de Tunis, Sfax' },
    ]);

    /* --------------------------------- Clients ------------------------------ */
    const clients = await Client.bulkCreate([
      { nom: 'Société GameZone', telephone: '98 123 456', email: 'contact@gamezone.tn', adresse: 'Centre Urbain Nord, Tunis' },
      { nom: 'Ahmed Mansour', telephone: '22 555 888', email: 'ahmed.mansour@email.tn', adresse: 'Sousse' },
      { nom: 'Institut Supérieur Privé', telephone: '71 777 999', email: 'achat@isp.tn', adresse: 'Manouba' },
      { nom: 'Client comptoir', telephone: '', email: '', adresse: '' },
    ]);

    /* ----------------- Commandes fournisseurs (déjà reçues) ----------------- */
    // Une commande reçue : crée des mouvements d'entrée cohérents avec le stock initial
    const cmd1 = await CommandeFournisseur.create({
      reference: 'CMD-2026-0001', date: '2026-01-15', statut: 'recue', montantTotal: 0,
      fournisseurId: fournisseurs[0].id, utilisateurId: 2,
    });
    const lignesCmd1 = [
      { produitId: produits[0].id, quantite: 10, prixUnitaire: 520 },
      { produitId: produits[7].id, quantite: 15, prixUnitaire: 160 },
    ];
    let totalCmd1 = 0;
    for (const l of lignesCmd1) {
      await LigneCommande.create({ commandeId: cmd1.id, ...l });
      totalCmd1 += l.quantite * l.prixUnitaire;
      await MouvementStock.create({ type: 'entree', quantite: l.quantite, motif: `Réception commande ${cmd1.reference}`, produitId: l.produitId, utilisateurId: 2, date: '2026-01-16' });
    }
    cmd1.montantTotal = totalCmd1;
    await cmd1.save();

    // Une commande encore en attente (sans impact stock)
    const cmd2 = await CommandeFournisseur.create({
      reference: 'CMD-2026-0002', date: '2026-06-10', statut: 'en_attente', montantTotal: 3500,
      fournisseurId: fournisseurs[1].id, utilisateurId: 2,
    });
    await LigneCommande.create({ commandeId: cmd2.id, produitId: produits[5].id, quantite: 2, prixUnitaire: 1900 });

    /* --------------------- Ventes réparties sur l'année --------------------- */
    const ventesDemo = [
      { date: '2026-02-05', clientId: clients[1].id, lignes: [{ produitId: produits[18].id, quantite: 2, prixUnitaire: 169 }, { produitId: produits[19].id, quantite: 1, prixUnitaire: 129 }] },
      { date: '2026-03-12', clientId: clients[0].id, lignes: [{ produitId: produits[4].id, quantite: 1, prixUnitaire: 1349 }, { produitId: produits[0].id, quantite: 1, prixUnitaire: 599 }] },
      { date: '2026-03-28', clientId: clients[3].id, lignes: [{ produitId: produits[9].id, quantite: 2, prixUnitaire: 279 }] },
      { date: '2026-04-09', clientId: clients[2].id, lignes: [{ produitId: produits[21].id, quantite: 3, prixUnitaire: 549 }] },
      { date: '2026-04-22', clientId: clients[1].id, lignes: [{ produitId: produits[7].id, quantite: 2, prixUnitaire: 199 }, { produitId: produits[10].id, quantite: 1, prixUnitaire: 139 }] },
      { date: '2026-05-03', clientId: clients[0].id, lignes: [{ produitId: produits[1].id, quantite: 1, prixUnitaire: 1290 }, { produitId: produits[12].id, quantite: 1, prixUnitaire: 459 }] },
      { date: '2026-05-19', clientId: clients[3].id, lignes: [{ produitId: produits[23].id, quantite: 5, prixUnitaire: 29 }, { produitId: produits[24].id, quantite: 4, prixUnitaire: 35 }] },
      { date: '2026-06-02', clientId: clients[2].id, lignes: [{ produitId: produits[22].id, quantite: 2, prixUnitaire: 849 }] },
      { date: '2026-06-18', clientId: clients[1].id, lignes: [{ produitId: produits[18].id, quantite: 1, prixUnitaire: 169 }, { produitId: produits[15].id, quantite: 1, prixUnitaire: 189 }] },
    ];

    let compteurVente = 0;
    for (const v of ventesDemo) {
      compteurVente += 1;
      const montant = v.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
      const vente = await Vente.create({
        reference: `FAC-2026-${String(compteurVente).padStart(4, '0')}`,
        date: v.date, statut: 'payee', montantTotal: montant,
        clientId: v.clientId, utilisateurId: 2,
      });
      for (const l of v.lignes) {
        await LigneVente.create({ venteId: vente.id, produitId: l.produitId, quantite: l.quantite, prixUnitaire: l.prixUnitaire, remise: 0 });
        await MouvementStock.create({ type: 'sortie', quantite: l.quantite, motif: `Vente ${vente.reference}`, produitId: l.produitId, utilisateurId: 2, date: v.date });
      }
    }
    console.log(`✔ ${ventesDemo.length} ventes de démonstration insérées.`);

    console.log('\n========================================');
    console.log('  Base de données peuplée avec succès !');
    console.log('  Comptes de démonstration :');
    console.log('   • Admin       : admin@gestipc.tn       / admin123');
    console.log('   • Magasinier  : magasinier@gestipc.tn  / magasin123');
    console.log('   • Gérant      : gerant@gestipc.tn       / gerant123');
    console.log('========================================\n');

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('[Erreur lors du peuplement]', err);
    process.exit(1);
  }
}

seed();
