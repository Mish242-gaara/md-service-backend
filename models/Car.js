// =============================================
// MD SERVICE - Modèle Voiture (PostgreSQL)
// =============================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Tarification stockée en JSON
  pricing: {
    type: DataTypes.JSONB,
    defaultValue: { perDay: 0, per2Days: null, per3Days: null, perWeek: null },
  },
  currency: {
    type: DataTypes.STRING(5),
    defaultValue: 'XAF',
  },
  transmission: {
    type: DataTypes.STRING(20),
    defaultValue: 'Manuelle',
  },
  fuel: {
    type: DataTypes.STRING(20),
    defaultValue: 'Essence',
  },
  seats: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  features: {
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
  tableName: 'cars',
  timestamps: true,
});

module.exports = Car;
