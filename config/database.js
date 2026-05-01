// =============================================
// MD SERVICE - Configuration PostgreSQL (Sequelize)
// =============================================
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Mettre console.log pour debug SQL
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

    // Synchroniser tous les modèles (créer les tables si elles n'existent pas)
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

    const existing = await Admin.findOne({ where: { email: process.env.ADMIN_EMAIL } });
    if (!existing) {
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await Admin.create({
        name: 'Administrateur MD Service',
        email: process.env.ADMIN_EMAIL,
        password: hashed,
      });
      console.log(`👤 Admin créé: ${process.env.ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error('Erreur création admin:', err.message);
  }
};

module.exports = { sequelize, connectDB };
