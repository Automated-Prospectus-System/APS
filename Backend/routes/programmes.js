const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');

// GET /api/programmes
router.get('/', async (req, res) => {
  try {
    const { institution, faculty, qual_type, entry_type, search, page = 1, limit = 50 } = req.query;
    let query = `
      SELECT p.*, f.faculty_name, f.institution_id, i.name AS institution_name, i.grading_system
      FROM programmes p
      JOIN faculties f   ON p.faculty_id = f.faculty_id
      JOIN institutions i ON f.institution_id = i.institution_id
      WHERE p.active = TRUE
    `;
    const params = [];

    if (institution) { query += ' AND f.institution_id = ?'; params.push(institution.toUpperCase()); }
    if (faculty)      { query += ' AND p.faculty_id = ?';    params.push(faculty); }
    if (qual_type)    { query += ' AND p.qualification_type = ?'; params.push(qual_type); }
    if (entry_type)   { query += ' AND p.entry_type = ?'; params.push(entry_type); }
    if (search) {
      query += ' AND (p.programme_name LIKE ? OR f.faculty_name LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like);
    }

    query += ' ORDER BY i.name, f.faculty_name, p.programme_name';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const [programmes] = await pool.execute(query, params);
    res.json({ success: true, count: programmes.length, data: programmes });
  } catch (err) {
    console.error('Programmes error:', err);
    res.status(500).json({ success: false, message: 'Error fetching programmes.' });
  }
});

// GET /api/programmes/compare?ids=P001,P002,P003
router.get('/compare', async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
    if (ids.length < 2) return res.status(400).json({ success: false, message: 'Provide 2–3 programme IDs.' });

    const placeholders = ids.map(() => '?').join(',');
    const [programmes] = await pool.execute(`
      SELECT p.*, f.faculty_name, f.institution_id, i.name AS institution_name, i.grading_system,
             i.location, i.website, i.email, i.phone
      FROM programmes p
      JOIN faculties f   ON p.faculty_id = f.faculty_id
      JOIN institutions i ON f.institution_id = i.institution_id
      WHERE p.programme_id IN (${placeholders}) AND p.active = TRUE
    `, ids);

    // Attach subject requirements per programme
    const result = await Promise.all(programmes.map(async (p) => {
      const [reqs] = await pool.execute(
        'SELECT * FROM subject_requirements WHERE programme_id = ? AND is_compulsory = TRUE',
        [p.programme_id]
      );
      const [threshold] = await pool.execute(
        'SELECT * FROM aps_thresholds WHERE programme_id = ?',
        [p.programme_id]
      );
      return { ...p, requirements: reqs, threshold: threshold[0] || null };
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Compare error:', err);
    res.status(500).json({ success: false, message: 'Error comparing programmes.' });
  }
});

// GET /api/programmes/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, f.faculty_name, f.institution_id, i.name AS institution_name,
             i.grading_system, i.location, i.website, i.email, i.phone
      FROM programmes p
      JOIN faculties f   ON p.faculty_id = f.faculty_id
      JOIN institutions i ON f.institution_id = i.institution_id
      WHERE p.programme_id = ? AND p.active = TRUE
    `, [req.params.id.toUpperCase()]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Programme not found.' });

    const programme = rows[0];

    const [reqs] = await pool.execute('SELECT * FROM subject_requirements WHERE programme_id = ?', [programme.programme_id]);
    const [gradeRules] = await pool.execute('SELECT * FROM programme_grade_rules WHERE programme_id = ?', [programme.programme_id]);
    const [threshold] = await pool.execute('SELECT * FROM aps_thresholds WHERE programme_id = ?', [programme.programme_id]);

    res.json({
      success: true,
      data: { ...programme, requirements: reqs, grade_rules: gradeRules, threshold: threshold[0] || null }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching programme.' });
  }
});

module.exports = router;
