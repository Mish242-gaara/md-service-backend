// =============================================
// MD SERVICE - Stats Dashboard (PostgreSQL)
// =============================================
const express = require('express');
const router  = express.Router();
const { Apartment, Car, Reservation } = require('../models');
const { protect } = require('../middleware/auth');
const { Op, fn, col, literal } = require('sequelize');

router.get('/', protect, async (req, res) => {
  try {
    const [
      totalApts, availableApts,
      totalCars, availableCars,
      totalResa, pendingResa,
      confirmedResa, recentResa,
    ] = await Promise.all([
      Apartment.count(),
      Apartment.count({ where: { isAvailable: true } }),
      Car.count(),
      Car.count({ where: { isAvailable: true } }),
      Reservation.count(),
      Reservation.count({ where: { status: 'en_attente' } }),
      Reservation.count({ where: { status: 'confirmée' } }),
      Reservation.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'client', 'type', 'listingTitle', 'status', 'createdAt', 'totalPrice'],
      }),
    ]);

    // Revenus totaux
    const revenueResult = await Reservation.findOne({
      where: { status: { [Op.in]: ['confirmée', 'terminée'] } },
      attributes: [[fn('SUM', col('totalPrice')), 'total']],
      raw: true,
    });
    const totalRevenue = parseFloat(revenueResult?.total || 0);

    res.json({
      apartments: { total: totalApts, available: availableApts, occupied: totalApts - availableApts },
      cars:        { total: totalCars, available: availableCars, occupied: totalCars - availableCars },
      reservations: { total: totalResa, pending: pendingResa, confirmed: confirmedResa },
      revenue:     { total: totalRevenue, currency: 'XAF' },
      recentReservations: recentResa,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
