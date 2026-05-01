// =============================================
// MD SERVICE - Routes Voitures (PostgreSQL)
// =============================================
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Car } = require('../models');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.available === 'true') where.isAvailable = true;
    if (req.query.featured  === 'true') where.featured    = true;
    if (req.query.transmission) where.transmission = req.query.transmission;
    if (req.query.fuel)         where.fuel         = req.query.fuel;
    if (req.query.brand)
      where.brand = { [Op.iLike]: `%${req.query.brand}%` };

    const { count, rows } = await Car.findAndCountAll({
      where,
      order: [['featured', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      cars: rows,
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

router.get('/featured', async (req, res) => {
  try {
    const cars = await Car.findAll({
      where: { featured: true, isAvailable: true },
      order: [['createdAt', 'DESC']],
      limit: 6,
    });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture non trouvée' });
    await car.increment('views');
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.post('/', protect, [
  body('title').notEmpty().withMessage('Titre requis'),
  body('brand').notEmpty().withMessage('Marque requise'),
  body('model').notEmpty().withMessage('Modèle requis'),
  body('year').isNumeric().withMessage('Année invalide'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const car = await Car.create(req.body);
    res.status(201).json({ message: 'Voiture créée', car });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture non trouvée' });
    await car.update(req.body);
    res.json({ message: 'Voiture mise à jour', car });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.patch('/:id/availability', protect, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture non trouvée' });
    await car.update({ isAvailable: req.body.isAvailable });
    res.json({ message: `Marqué comme ${req.body.isAvailable ? 'disponible' : 'loué'}`, car });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture non trouvée' });
    await car.destroy();
    res.json({ message: 'Voiture supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
