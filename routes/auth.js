// =============================================
// MD SERVICE - Routes Auth (PostgreSQL)
// =============================================
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Admin } = require('../models');
const { protect } = require('../middleware/auth');

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    res.json({
      message: 'Connexion réussie',
      token: genToken(admin.id),
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ admin: req.admin });
});

router.put('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }).withMessage('Min 6 caractères'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const admin = await Admin.findByPk(req.admin.id);
    const ok = await bcrypt.compare(req.body.currentPassword, admin.password);
    if (!ok) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    admin.password = await bcrypt.hash(req.body.newPassword, 12);
    await admin.save();
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
