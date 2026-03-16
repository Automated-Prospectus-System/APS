const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute(
      'SELECT user_id, email, full_name, role, is_active FROM users WHERE user_id = ?',
      [decoded.user_id]
    );
    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
}

// Optional auth — sets req.user if token present, but does not block
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute(
      'SELECT user_id, email, full_name, role FROM users WHERE user_id = ?',
      [decoded.user_id]
    );
    if (rows.length) req.user = rows[0];
  } catch { /* ignore */ }
  next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth };
