const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');

// GET /api/institutions
router.get('/', async (req, res) => {
  try {
    const [institutions] = await pool.execute('SELECT * FROM institutions WHERE active = TRUE ORDER BY name');
    res.json({ success: true, data: institutions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching institutions.' });
  }
});

// GET /api/institutions/:id
router.get('/:id', async (req, res) => {
  try {
    const [inst] = await pool.execute('SELECT * FROM institutions WHERE institution_id = ?', [req.params.id.toUpperCase()]);
    if (!inst.length) return res.status(404).json({ success: false, message: 'Institution not found.' });

    const [faculties] = await pool.execute(
      'SELECT * FROM faculties WHERE institution_id = ? ORDER BY faculty_name',
      [req.params.id.toUpperCase()]
    );

    const [programmes] = await pool.execute(`
      SELECT p.*, f.faculty_name
      FROM programmes p
      JOIN faculties f ON p.faculty_id = f.faculty_id
      WHERE f.institution_id = ? AND p.active = TRUE
      ORDER BY f.faculty_name, p.programme_name
    `, [req.params.id.toUpperCase()]);

    const stats = {
      total_programmes:  programmes.length,
      degrees:           programmes.filter(p => p.qualification_type === 'degree').length,
      diplomas:          programmes.filter(p => p.qualification_type === 'diploma').length,
      certificates:      programmes.filter(p => p.qualification_type === 'certificate').length,
      honours:           programmes.filter(p => p.qualification_type === 'honours').length,
      direct_entry:      programmes.filter(p => p.entry_type === 'direct').length,
      indirect_entry:    programmes.filter(p => p.entry_type === 'indirect').length
    };

    res.json({ success: true, data: { ...inst[0], faculties, programmes, stats } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching institution.' });
  }
});

module.exports = router;
