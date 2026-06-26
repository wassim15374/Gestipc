const { Client } = require('../models');

/**
 * Contrôleur de gestion des clients.
 */

// GET /api/clients
exports.lister = async (req, res, next) => {
  try {
    const clients = await Client.findAll({ order: [['nom', 'ASC']] });
    res.json(clients);
  } catch (err) { next(err); }
};

// GET /api/clients/:id
exports.recuperer = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });
    res.json(client);
  } catch (err) { next(err); }
};

// POST /api/clients
exports.creer = async (req, res, next) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) { next(err); }
};

// PUT /api/clients/:id
exports.modifier = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });
    await client.update(req.body);
    res.json(client);
  } catch (err) { next(err); }
};

// DELETE /api/clients/:id
exports.supprimer = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });
    await client.destroy();
    res.json({ message: 'Client supprimé.' });
  } catch (err) { next(err); }
};
