// =============================================
// MD SERVICE - Modèle Appartement (PostgreSQL)
// =============================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Apartment = sequelize.define('Apartment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  pricePerNight: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  currency: {
    type: DataTypes.STRING(5),
    defaultValue: 'XAF',
  },
  rooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  maxGuests: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
  },
  // Tableaux stockés en JSON PostgreSQL
  amenities: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  video: {
    type: DataTypes.JSONB,
    defaultValue: null,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'apartments',
  timestamps: true,
});

module.exports = Apartment;
