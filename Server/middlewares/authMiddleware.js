// Backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.JWT_SECRET || 'changeme';

// optional authentication: decodes token if present and sets req.user, but does not fail if missing
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) {
    req.user = null;
    return next();
  }
  const parts = auth.split(' ');
  if (parts.length !== 2) { req.user = null; return next(); }
  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: payload.id, role: payload.role || 'user', name: payload.name || '', email: payload.email || '' };
    return next();
  } catch (err) {
    console.warn('authMiddleware token invalid', err.message);
    req.user = null;
    return next();
  }
}

// stricter middleware — require token
function requireAuth(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    next();
  });
}

function roleCheckAny(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { authMiddleware, requireAuth, roleCheckAny };
