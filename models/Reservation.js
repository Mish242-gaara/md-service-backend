// =============================================
// MD SERVICE - Modèle Réservation (PostgreSQL)
// =============================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('apartment', 'car'),
    allowNull: false,
  },
  listingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  listingType: {
    type: DataTypes.STRING(20), // 'Apartment' | 'Car'
    allowNull: false,
  },
  listingTitle: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  // Infos client en JSON
  client: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  duration: {
    type: DataTypes.JSONB,
    defaultValue: null,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(5),
    defaultValue: 'XAF',
  },
  status: {
    type: DataTypes.ENUM('en_attente', 'confirmée', 'annulée', 'terminée'),
    defaultValue: 'en_attente',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'reservations',
  timestamps: true,
});

module.exports = Reservation;
