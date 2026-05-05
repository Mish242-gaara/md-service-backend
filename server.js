// =============================================
// MD SERVICE - Serveur Principal Express
// =============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const https = require('https'); // Ajouté pour le Self-Ping
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 10000;

// ── Connexion PostgreSQL ──────────────────────
connectDB();

// ── Middlewares ───────────────────────────────

// Configuration CORS dynamique pour MD Service
const allowedOrigins = [
  'http://localhost:3000',
  'https://md-service.vercel.app',
  'https://md-service-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Autoriser les requêtes sans origine (comme Postman ou les mobiles)
    if (!origin) return callback(null, true);
    
    // 2. Autoriser si l'URL est dans la liste ou est un sous-domaine de vercel.app
    const isAllowed = allowedOrigins.indexOf(origin) !== -1;
    const isVercelPreview = origin.endsWith('.vercel.app');
    
    if (isAllowed || isVercelPreview || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('🚫 Origine bloquée par CORS:', origin);
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

// ── Fichiers statiques uploadés ───────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes API ────────────────────────────────
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

// ── Lancement du serveur ──────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 MD Service API démarrée sur le port ${PORT}`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Domaines autorisés: ${allowedOrigins.join(', ')} et *.vercel.app`);

  // ── Système de Self-Ping (Garder Render éveillé) ──
  // S'exécute toutes les 5 minutes
  setInterval(() => {
    const url = 'https://md-service-backend.onrender.com/api/health';
    https.get(url, (res) => {
      console.log(`[Self-Ping] Status: ${res.statusCode} - Serveur maintenu éveillé.`);
    }).on('error', (err) => {
      console.error(`[Self-Ping] Erreur: ${err.message}`);
    });
  }, 5 * 60 * 1000); 
});