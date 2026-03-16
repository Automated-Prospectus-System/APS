const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const { pool }  = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { cloudinary, upload, uploadBuffer } = require('../config/cloudinary');

// GET /api/users/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [req.user.user_id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    const { password_hash, ...user } = rows[0];
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching profile.' });
  }
});

// PATCH /api/users/profile
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, phone, school_name, country, city, grade_level, email_notifications } = req.body;
    await pool.execute(
      `UPDATE users SET full_name=?, phone=?, school_name=?, country=?, city=?, grade_level=?, email_notifications=?
       WHERE user_id=?`,
      [full_name, phone || null, school_name || null, country || 'Lesotho',
       city || null, grade_level || null, email_notifications !== false ? 1 : 0, req.user.user_id]
    );
    const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [req.user.user_id]);
    const { password_hash, ...user } = rows[0];
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
});

// POST /api/users/profile/photo
router.post('/profile/photo', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    // Delete old Cloudinary photo if exists
    const [old] = await pool.execute('SELECT profile_photo_public_id FROM users WHERE user_id = ?', [req.user.user_id]);
    if (old[0]?.profile_photo_public_id) {
      await cloudinary.uploader.destroy(old[0].profile_photo_public_id).catch(() => {});
    }

    const publicId = `user_${req.user.user_id}_${Date.now()}`;
    const result = await uploadBuffer(req.file.buffer, publicId);

    await pool.execute(
      'UPDATE users SET profile_photo_url = ?, profile_photo_public_id = ? WHERE user_id = ?',
      [result.secure_url, result.public_id, req.user.user_id]
    );
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ success: false, message: 'Error uploading photo.' });
  }
});

// PATCH /api/users/change-password
router.patch('/change-password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE user_id = ?', [req.user.user_id]);
    if (!rows[0].password_hash)
      return res.status(400).json({ success: false, message: 'Google OAuth accounts cannot change password here.' });

    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(new_password, 12);
    await pool.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [hash, req.user.user_id]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error changing password.' });
  }
});

// --- Saved Programmes ---

// GET /api/users/saved
router.get('/saved', requireAuth, async (req, res) => {
  try {
    const [saved] = await pool.execute(`
      SELECT sp.*, p.programme_name, p.qualification_type, p.duration_years, p.entry_type,
             p.fee_local, p.fee_intl, f.faculty_name, f.institution_id, i.name AS institution_name
      FROM saved_programmes sp
      JOIN programmes p  ON sp.programme_id = p.programme_id
      JOIN faculties f   ON p.faculty_id = f.faculty_id
      JOIN institutions i ON f.institution_id = i.institution_id
      WHERE sp.user_id = ?
      ORDER BY sp.saved_at DESC
    `, [req.user.user_id]);
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching saved programmes.' });
  }
});

// POST /api/users/saved/:programmeId
router.post('/saved/:programmeId', requireAuth, async (req, res) => {
  try {
    const { notes } = req.body;
    await pool.execute(
      'INSERT INTO saved_programmes (user_id, programme_id, notes) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE notes = VALUES(notes)',
      [req.user.user_id, req.params.programmeId.toUpperCase(), notes || null]
    );
    res.json({ success: true, message: 'Programme saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving programme.' });
  }
});

// DELETE /api/users/saved/:programmeId
router.delete('/saved/:programmeId', requireAuth, async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM saved_programmes WHERE user_id = ? AND programme_id = ?',
      [req.user.user_id, req.params.programmeId.toUpperCase()]
    );
    res.json({ success: true, message: 'Programme removed from saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing saved programme.' });
  }
});

// --- Deadline Reminders ---

// GET /api/users/deadlines
router.get('/deadlines', requireAuth, async (req, res) => {
  try {
    const [deadlines] = await pool.execute(
      'SELECT * FROM deadline_reminders WHERE user_id = ? ORDER BY reminder_date ASC',
      [req.user.user_id]
    );
    res.json({ success: true, data: deadlines });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching deadlines.' });
  }
});

// POST /api/users/deadlines
router.post('/deadlines', requireAuth, async (req, res) => {
  try {
    const { reminder_title, reminder_date, programme_id, institution_id, notes } = req.body;
    if (!reminder_title || !reminder_date)
      return res.status(400).json({ success: false, message: 'Title and date are required.' });

    const [result] = await pool.execute(
      `INSERT INTO deadline_reminders (user_id, programme_id, institution_id, reminder_date, reminder_title, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.user_id, programme_id || null, institution_id || null, reminder_date, reminder_title, notes || null]
    );
    res.status(201).json({ success: true, message: 'Reminder added.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding deadline.' });
  }
});

// DELETE /api/users/deadlines/:id
router.delete('/deadlines/:id', requireAuth, async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM deadline_reminders WHERE reminder_id = ? AND user_id = ?',
      [req.params.id, req.user.user_id]
    );
    res.json({ success: true, message: 'Reminder deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting reminder.' });
  }
});

// --- Notifications ---

// GET /api/users/notifications
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const [notifs] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.user_id]
    );
    const unread = notifs.filter(n => !n.is_read).length;
    res.json({ success: true, data: notifs, unread_count: unread });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications.' });
  }
});

// PATCH /api/users/notifications/read-all
router.patch('/notifications/read-all', requireAuth, async (req, res) => {
  try {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.user_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error marking notifications.' });
  }
});

// GET /api/users/stats — dashboard stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const uid = req.user.user_id;
    const [[{ saved_count }]]   = await pool.execute('SELECT COUNT(*) AS saved_count FROM saved_programmes WHERE user_id = ?', [uid]);
    const [[{ check_count }]]   = await pool.execute('SELECT COUNT(*) AS check_count FROM eligibility_sessions WHERE user_id = ?', [uid]);
    const [[{ deadline_count }]] = await pool.execute('SELECT COUNT(*) AS deadline_count FROM deadline_reminders WHERE user_id = ? AND reminder_date >= CURDATE()', [uid]);
    const [[{ unread_count }]]  = await pool.execute('SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE', [uid]);

    const [lastSession] = await pool.execute(
      'SELECT session_token, created_at FROM eligibility_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [uid]
    );

    res.json({
      success: true,
      stats: {
        saved_programmes:   parseInt(saved_count),
        eligibility_checks: parseInt(check_count),
        upcoming_deadlines: parseInt(deadline_count),
        unread_notifications: parseInt(unread_count),
        last_session_token: lastSession[0]?.session_token || null,
        last_check_date:    lastSession[0]?.created_at || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
});

module.exports = router;
