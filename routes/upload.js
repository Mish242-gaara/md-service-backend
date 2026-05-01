// =============================================
// LOKEA - Routes Upload Médias
// =============================================
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// ── POST /api/upload/images ───────────────────
// Upload plusieurs images (admin)
router.post('/images', protect, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucune image reçue' });
    }

    const files = req.files.map((file) => ({
      url: `/uploads/images/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));

    res.json({ message: `${files.length} image(s) uploadée(s)`, files });
  } catch (err) {
    res.status(500).json({ message: 'Erreur upload', error: err.message });
  }
});

// ── POST /api/upload/video ────────────────────
// Upload une vidéo (admin)
router.post('/video', protect, upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune vidéo reçue' });
    }

    res.json({
      message: 'Vidéo uploadée avec succès',
      file: {
        url: `/uploads/videos/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur upload vidéo', error: err.message });
  }
});

// ── DELETE /api/upload/:type/:filename ────────
// Supprimer un fichier uploadé
router.delete('/:type/:filename', protect, (req, res) => {
  try {
    const { type, filename } = req.params;
    if (!['images', 'videos'].includes(type)) {
      return res.status(400).json({ message: 'Type invalide' });
    }

    const filePath = path.join(__dirname, '../uploads', type, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Fichier supprimé' });
    } else {
      res.status(404).json({ message: 'Fichier non trouvé' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression', error: err.message });
  }
});

module.exports = router;
