// =============================================
// MD SERVICE - Routes Appartements (PostgreSQL)
// =============================================
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Apartment } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/apartments — liste avec filtres + pagination
router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.available === 'true') where.isAvailable = true;
    if (req.query.featured  === 'true') where.featured    = true;
    if (req.query.location)
      where.location = { [Op.iLike]: `%${req.query.location}%` };
    if (req.query.minPrice || req.query.maxPrice) {
      where.pricePerNight = {};
      if (req.query.minPrice) where.pricePerNight[Op.gte] = req.query.minPrice;
      if (req.query.maxPrice) where.pricePerNight[Op.lte] = req.query.maxPrice;
    }

    const { count, rows } = await Apartment.findAndCountAll({
      where,
      order: [['featured', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      apartments: rows,
      pagination: {
        page, limit, total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/apartments/featured
router.get('/featured', async (req, res) => {
  try {
    const apartments = await Apartment.findAll({
      where: { featured: true, isAvailable: true },
      order: [['createdAt', 'DESC']],
      limit: 6,
    });
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/apartments/:id
router.get('/:id', async (req, res) => {
  try {
    const apt = await Apartment.findByPk(req.params.id);
    if (!apt) return res.status(404).json({ message: 'Appartement non trouvé' });
    await apt.increment('views');
    res.json(apt);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/apartments (admin)
router.post('/', protect, [
  body('title').notEmpty().withMessage('Titre requis'),
  body('description').notEmpty().withMessage('Description requise'),
  body('location').notEmpty().withMessage('Localisation requise'),
  body('pricePerNight').isNumeric().withMessage('Prix invalide'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const apt = await Apartment.create(req.body);
    res.status(201).json({ message: 'Appartement créé', apartment: apt });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /api/apartments/:id (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const apt = await Apartment.findByPk(req.params.id);
    if (!apt) return res.status(404).json({ message: 'Appartement non trouvé' });
    await apt.update(req.body);
    res.json({ message: 'Appartement mis à jour', apartment: apt });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PATCH /api/apartments/:id/availability (admin)
router.patch('/:id/availability', protect, async (req, res) => {
  try {
    const apt = await Apartment.findByPk(req.params.id);
    if (!apt) return res.status(404).json({ message: 'Appartement non trouvé' });
    await apt.update({ isAvailable: req.body.isAvailable });
    res.json({ message: `Marqué comme ${req.body.isAvailable ? 'disponible' : 'loué'}`, apartment: apt });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/apartments/:id (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const apt = await Apartment.findByPk(req.params.id);
    if (!apt) return res.status(404).json({ message: 'Appartement non trouvé' });
    await apt.destroy();
    res.json({ message: 'Appartement supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
