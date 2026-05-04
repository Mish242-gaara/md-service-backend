// =============================================
// MD SERVICE - Configuration PostgreSQL (Sequelize)
// =============================================
const { Sequelize } = require('sequelize');

// On utilise DATABASE_URL pour la production (Neon), sinon on garde les variables locales
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = isProduction 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // CRITIQUE pour Neon/Render
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connecté avec succès');

    // Synchroniser tous les modèles
    // { alter: true } permet de mettre à jour les tables sans les supprimer
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synchronisées');

    // Créer l'admin par défaut
    await createDefaultAdmin();
  } catch (error) {
    console.error('❌ Erreur PostgreSQL:', error.message);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const { Admin } = require('../models');
    const bcrypt = require('bcryptjs');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mdservice.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@MDService2026';

    const existing = await Admin.findOne({ where: { email: adminEmail } });
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 12);
      await Admin.create({
        name: 'Administrateur MD Service',
        email: adminEmail,
        password: hashed,
      });
      console.log(`👤 Admin créé: ${adminEmail}`);
    }
  } catch (err) {
    console.error('Erreur création admin:', err.message);
  }
};

module.exports = { sequelize, connectDB };