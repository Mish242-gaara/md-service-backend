// =============================================
// MD SERVICE - Middleware JWT
// =============================================
const jwt   = require('jsonwebtoken');
const { Admin } = require('../models');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer '))
    token = req.headers.authorization.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Accès refusé. Token manquant.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    if (!admin) return res.status(401).json({ message: 'Admin introuvable.' });
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Session expirée. Reconnectez-vous.' });
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

module.exports = { protect };
