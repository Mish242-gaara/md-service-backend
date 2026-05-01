// =============================================
// MD SERVICE - Serveur Principal Express
// =============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connexion PostgreSQL ──────────────────────
connectDB();

// ── Middlewares ───────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// ── Fichiers statiques uploadés ───────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes API ────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/apartments',   require('./routes/apartments'));
app.use('/api/cars',         require('./routes/cars'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/upload',       require('./routes/upload'));
app.use('/api/stats',        require('./routes/stats'));

// ── Santé ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MD Service API opérationnelle', timestamp: new Date() });
});

// ── 404 ───────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route non trouvée' }));

// ── Erreurs globales ──────────────────────────
app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Erreur interne' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 MD Service API démarrée sur http://localhost:${PORT}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
});
