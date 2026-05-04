// =============================================
// MD SERVICE - Configuration PostgreSQL (Sequelize)
// =============================================
const { Sequelize } = require('sequelize');

// Utilisation de DATABASE_URL pour la production (Neon), sinon variables locales
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = isProduction 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Indispensable pour Neon/Render
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'mdservice',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'root',
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
    console.log('✅ PostgreSQL connecté avec succès (Neon)');

    // Synchronisation des modèles
    // alter: true met à jour les colonnes sans vider les données existantes
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synchronisées');

    // Vérification/Création de l'admin
    await createDefaultAdmin();
  } catch (error) {
    console.error('❌ Erreur PostgreSQL:', error.message);
    // On ne coupe pas le processus immédiatement pour permettre des logs sur Render
    setTimeout(() => process.exit(1), 1000);
  }
};

const createDefaultAdmin = async () => {
  try {
    const { Admin } = require('../models');
    const bcrypt = require('bcryptjs');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mdservice.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@MDService2024';

    const existing = await Admin.findOne({ where: { email: adminEmail } });

    if (!existing) {
      // Création si l'admin n'existe pas
      const hashed = await bcrypt.hash(adminPassword, 12);
      await Admin.create({
        name: 'Administrateur MD Service',
        email: adminEmail,
        password: hashed,
      });
      console.log(`👤 Compte Admin initial créé : ${adminEmail}`);
    } else {
      // MISE À JOUR : Si tu changes le mot de passe dans les variables Render, 
      // il sera mis à jour en base de données au prochain redémarrage.
      const hashed = await bcrypt.hash(adminPassword, 12);
      existing.password = hashed;
      await existing.save();
      console.log(`✅ Identifiants Admin vérifiés/mis à jour pour : ${adminEmail}`);
    }
  } catch (err) {
    console.error('⚠️ Erreur création/maj admin:', err.message);
  }
};

module.exports = { sequelize, connectDB };