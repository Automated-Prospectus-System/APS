const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ user_count }]]    = await pool.execute('SELECT COUNT(*) AS user_count FROM users WHERE role = "student"');
    const [[{ prog_count }]]    = await pool.execute('SELECT COUNT(*) AS prog_count FROM programmes WHERE active = TRUE');
    const [[{ check_count }]]   = await pool.execute('SELECT COUNT(*) AS check_count FROM eligibility_sessions');
    const [[{ saved_count }]]   = await pool.execute('SELECT COUNT(*) AS saved_count FROM saved_programmes');

    const [recentChecks] = await pool.execute(`
      SELECT es.created_at, es.qual_type,
             (SELECT COUNT(*) FROM eligibility_results er WHERE er.session_id = es.session_id AND er.eligibility_status = 'ELIGIBLE') AS eligible_count,
             u.full_name, u.email
      FROM eligibility_sessions es
      LEFT JOIN users u ON es.user_id = u.user_id
      ORDER BY es.created_at DESC LIMIT 10
    `);

    const [topProgrammes] = await pool.execute(`
      SELECT er.programme_id, p.programme_name, f.institution_id, COUNT(*) AS times_eligible
      FROM eligibility_results er
      JOIN programmes p ON er.programme_id = p.programme_id
      JOIN faculties f ON p.faculty_id = f.faculty_id
      WHERE er.eligibility_status = 'ELIGIBLE'
      GROUP BY er.programme_id
      ORDER BY times_eligible DESC
      LIMIT 10
    `);

    const [eligibleByInstitution] = await pool.execute(`
      SELECT f.institution_id, COUNT(*) AS count
      FROM eligibility_results er
      JOIN programmes p ON er.programme_id = p.programme_id
      JOIN faculties f ON p.faculty_id = f.faculty_id
      WHERE er.eligibility_status = 'ELIGIBLE'
      GROUP BY f.institution_id
    `);

    res.json({
      success: true,
      stats: {
        total_students:    parseInt(user_count),
        total_programmes:  parseInt(prog_count),
        total_checks:      parseInt(check_count),
        total_saved:       parseInt(saved_count)
      },
      recent_checks:    recentChecks,
      top_programmes:   topProgrammes,
      by_institution:   eligibleByInstitution
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let query = 'SELECT user_id, full_name, email, role, country, school_name, profile_photo_url, is_active, created_at, last_login FROM users WHERE 1=1';
    const params = [];
    if (search) { query += ' AND (full_name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}`;

    const [users] = await pool.execute(query, params);
    const [[{ total }]] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    res.json({ success: true, users, total: parseInt(total) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users.' });
  }
});

// PATCH /api/admin/users/:id/toggle
router.patch('/users/:id/toggle', async (req, res) => {
  try {
    await pool.execute('UPDATE users SET is_active = NOT is_active WHERE user_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error toggling user.' });
  }
});

// PATCH /api/admin/programmes/:id/toggle
router.patch('/programmes/:id/toggle', async (req, res) => {
  try {
    await pool.execute('UPDATE programmes SET active = NOT active WHERE programme_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error toggling programme.' });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student','staff','admin'].includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    await pool.execute('UPDATE users SET role = ? WHERE user_id = ?', [role, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating role.' });
  }
});

// GET /api/admin/audit (alias: /logs)
router.get(['/audit', '/logs'], async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const [logs] = await pool.execute(`
      SELECT al.*, u.full_name, u.email FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC LIMIT ${limit}
    `);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching audit log.' });
  }
});

module.exports = router;
