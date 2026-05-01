// =============================================
// LOKEA - Configuration Upload Fichiers (Multer)
// =============================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVideo = file.mimetype.startsWith('video/');
    const folder = isVideo
      ? path.join(__dirname, '../uploads/videos')
      : path.join(__dirname, '../uploads/images');
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `lokea-${uniqueSuffix}${ext}`);
  },
});

// Filtre des types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|webp/;
  const allowedVideos = /mp4|mov|avi|mkv|webm/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (file.mimetype.startsWith('image/') && allowedImages.test(ext)) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/') && allowedVideos.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.originalname}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (process.env.MAX_FILE_SIZE || 50) * 1024 * 1024, // 50MB par défaut
    files: 10, // Max 10 fichiers à la fois
  },
});

module.exports = upload;
