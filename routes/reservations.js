// =============================================
// MD SERVICE - Routes Réservations (PostgreSQL)
// =============================================
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Reservation, Apartment, Car } = require('../models');
const { protect } = require('../middleware/auth');

router.post('/', [
  body('type').isIn(['apartment','car']).withMessage('Type invalide'),
  body('listing').notEmpty().withMessage('Annonce requise'),
  body('client.name').notEmpty().withMessage('Nom requis'),
  body('client.phone').notEmpty().withMessage('Téléphone requis'),
  body('startDate').isISO8601().withMessage('Date début invalide'),
  body('endDate').isISO8601().withMessage('Date fin invalide'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { type, listing, startDate, endDate } = req.body;

    let listingDoc, listingType;
    if (type === 'apartment') {
      listingDoc  = await Apartment.findByPk(listing);
      listingType = 'Apartment';
    } else {
      listingDoc  = await Car.findByPk(listing);
      listingType = 'Car';
    }

    if (!listingDoc) return res.status(404).json({ message: 'Annonce non trouvée' });
    if (!listingDoc.isAvailable) return res.status(400).json({ message: 'Annonce non disponible' });

    const diffDays = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
    const pricePerDay = type === 'apartment'
      ? listingDoc.pricePerNight
      : listingDoc.pricing?.perDay;
    const totalPrice = diffDays > 0 ? diffDays * pricePerDay : 0;

    const reservation = await Reservation.create({
      type,
      listingId:    listingDoc.id,
      listingType,
      listingTitle: listingDoc.title,
      client:       req.body.client,
      startDate,
      endDate,
      duration:     { value: diffDays, unit: 'jours' },
      totalPrice,
      currency:     listingDoc.currency || 'XAF',
      message:      req.body.message || null,
    });

    res.status(201).json({ message: 'Demande envoyée avec succès !', reservation });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.type)   where.type   = req.query.type;

    const { count, rows } = await Reservation.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      reservations: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const r = await Reservation.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Réservation non trouvée' });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const valid = ['en_attente','confirmée','annulée','terminée'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Statut invalide' });

    const r = await Reservation.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Réservation non trouvée' });

    await r.update({ status, ...(adminNotes && { adminNotes }) });
    res.json({ message: `Statut: ${status}`, reservation: r });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const r = await Reservation.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Réservation non trouvée' });
    await r.destroy();
    res.json({ message: 'Réservation supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
