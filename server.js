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

// Configuration CORS pour MD Service
const allowedOrigins = [
  'http://localhost:3000',
  'https://md-service.vercel.app' // Ton URL Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Refusé par la politique CORS de MD Service'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// ── Fichiers statiques ────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes API ────────────────────────────────
// Nous gardons le préfixe /api qui est une bonne pratique
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/apartments',    require('./routes/apartments'));
app.use('/api/cars',          require('./routes/cars'));
app.use('/api/reservations',  require('./routes/reservations'));
app.use('/api/upload',        require('./routes/upload'));
app.use('/api/stats',         require('./routes/stats'));

// ── Santé & Test ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MD Service API opérationnelle', 
    env: process.env.NODE_ENV,
    timestamp: new Date() 
  });
});

// ── 404 & Redirection de secours ──────────────
// Si le frontend oublie /api, ce middleware tente d'aider ou renvoie 404
app.use((req, res) => {
  console.log(`⚠️ Route non trouvée : ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: 'Route non trouvée. Vérifiez que l\'URL commence par /api' 
  });
});

// ── Erreurs globales ──────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Erreur interne du serveur MD Service' 
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 MD Service API démarrée sur le port ${PORT}`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend autorisé: ${allowedOrigins.join(', ')}`);
});