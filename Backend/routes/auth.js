const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const passport = require('../config/passport');
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { sendWelcome, sendPasswordReset } = require('../utils/email');

function signToken(userId) {
  return jwt.sign({ user_id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function sanitizeUser(u) {
  const { password_hash, google_id, profile_photo_public_id, ...safe } = u;
  return safe;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, username, phone, school_name, country, city } = req.body;
    if (!full_name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const [existing] = await pool.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users (email, username, password_hash, full_name, phone, school_name, country, city, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [email, username || null, hash, full_name, phone || null, school_name || null, country || 'Lesotho', city || null]
    );

    await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, 'welcome', 'Welcome to APES!', ?)`,
      [result.insertId, `Welcome, ${full_name}! Your account is ready. Start checking your eligibility now.`]
    );

    const [user] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
    sendWelcome(user[0]).catch(() => {});  // fire and forget

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token:   signToken(result.insertId),
      user:    sanitizeUser(user[0])
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const user = rows[0];
    if (!user.is_active)
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
    if (!user.password_hash)
      return res.status(401).json({ success: false, message: 'This account uses Google Sign-In. Please login with Google.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    await pool.execute('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    return res.json({
      success: true,
      token:   signToken(user.user_id),
      user:    sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [req.user.user_id]);
  res.json({ success: true, user: sanitizeUser(rows[0]) });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });

    const user  = rows[0];
    const token = uuidv4();
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await pool.execute(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.user_id, token, expiry]
    );

    await sendPasswordReset(user, token);
    res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const [rows] = await pool.execute(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );
    if (!rows.length) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

    const hash = await bcrypt.hash(password, 12);
    await pool.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [hash, rows[0].user_id]);
    await pool.execute('UPDATE password_resets SET used = TRUE WHERE reset_id = ?', [rows[0].reset_id]);

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login.html?error=oauth_failed' }),
  (req, res) => {
    const token = signToken(req.user.user_id);
    res.redirect(`/dashboard.html?token=${token}`);
  }
);

module.exports = router;
