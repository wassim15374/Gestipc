const { Utilisateur } = require('../models');

/**
 * Contrôleur de gestion des utilisateurs (réservé à l'administrateur).
 */

// GET /api/utilisateurs
exports.lister = async (req, res, next) => {
  try {
    const utilisateurs = await Utilisateur.findAll({
      attributes: { exclude: ['motDePasse'] },
      order: [['nom', 'ASC']],
    });
    res.json(utilisateurs);
  } catch (err) { next(err); }
};

// GET /api/utilisateurs/:id
exports.recuperer = async (req, res, next) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id, {
      attributes: { exclude: ['motDePasse'] },
    });
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(utilisateur);
  } catch (err) { next(err); }
};

// POST /api/utilisateurs
exports.creer = async (req, res, next) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;
    const utilisateur = await Utilisateur.create({ nom, prenom, email, motDePasse, role });
    const { motDePasse: _, ...sansMotDePasse } = utilisateur.toJSON();
    res.status(201).json(sansMotDePasse);
  } catch (err) { next(err); }
};

// PUT /api/utilisateurs/:id
exports.modifier = async (req, res, next) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const { nom, prenom, email, role, actif, motDePasse } = req.body;
    Object.assign(utilisateur, { nom, prenom, email, role });
    if (typeof actif === 'boolean') utilisateur.actif = actif;
    if (motDePasse) utilisateur.motDePasse = motDePasse; // re-haché par le hook
    await utilisateur.save();

    const { motDePasse: _, ...sansMotDePasse } = utilisateur.toJSON();
    res.json(sansMotDePasse);
  } catch (err) { next(err); }
};

// DELETE /api/utilisateurs/:id
exports.supprimer = async (req, res, next) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    await utilisateur.destroy();
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) { next(err); }
};
