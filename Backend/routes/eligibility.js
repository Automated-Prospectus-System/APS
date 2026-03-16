const express    = require('express');
const router     = express.Router();
const { v4: uuidv4 } = require('uuid');
const { pool }   = require('../config/db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { runEligibilityCheck, checkSingleProgramme, getRecommendations } = require('../engine/dispatcher');
const { sendEligibilityResults } = require('../utils/email');
const { generateEligibilityReport } = require('../utils/pdf');

// POST /api/eligibility/check
router.post('/check', optionalAuth, async (req, res) => {
  try {
    const { subjects, qual_type, institution_filter } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length < 3) {
      return res.status(400).json({ success: false, message: 'Please provide at least 3 subjects.' });
    }

    // Validate subject format
    const validGrades = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const cleanSubjects = subjects.map(s => ({
      subject_id: (s.subject_id || s.subject || '').toUpperCase().replace(/\s+/g, '_'),
      grade:      (s.grade || '').toUpperCase()
    })).filter(s => s.subject_id && validGrades.includes(s.grade));

    if (cleanSubjects.length < 3) {
      return res.status(400).json({ success: false, message: 'Invalid subject/grade data.' });
    }

    const qualType = qual_type || 'LGCSE';
    const checkResult = await runEligibilityCheck(cleanSubjects, qualType, institution_filter || null);

    // Persist session
    const sessionToken = uuidv4();
    const userId = req.user?.user_id || null;

    const [sessionRow] = await pool.execute(
      'INSERT INTO eligibility_sessions (user_id, session_token, lgcse_results, qual_type) VALUES (?, ?, ?, ?)',
      [userId, sessionToken, JSON.stringify(cleanSubjects), qualType]
    );
    const sessionId = sessionRow.insertId;

    // Persist individual results
    const allResults = [
      ...checkResult.eligible.map(r => ({ ...r, status: 'ELIGIBLE' })),
      ...checkResult.borderline.map(r => ({ ...r, status: 'BORDERLINE' })),
      ...checkResult.not_eligible.map(r => ({ ...r, status: 'NOT_ELIGIBLE' }))
    ];

    if (allResults.length > 0) {
      const placeholders = allResults.map(() => '(?,?,?,?,?,?,?,?,?)').join(',');
      const values = allResults.flatMap(r => [
        sessionId, r.programme_id, r.status,
        r.aps_calculated ?? null, r.aps_max_allowed ?? null,
        JSON.stringify(r.failed_requirements || []),
        JSON.stringify(r.borderline_requirements || []),
        JSON.stringify(r.flags || []),
        r.entry_type
      ]);
      await pool.execute(
        `INSERT INTO eligibility_results
         (session_id,programme_id,eligibility_status,aps_calculated,aps_max_allowed,failed_requirements,borderline_requirements,flags,entry_type)
         VALUES ${placeholders}`,
        values
      );
    }

    // Email notification if logged-in user has it enabled
    if (req.user?.email_notifications) {
      sendEligibilityResults(req.user, checkResult.summary, sessionToken).catch(() => {});
    }

    // Notification in DB
    if (userId) {
      await pool.execute(
        `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, 'eligibility', ?, ?, ?)`,
        [userId,
          `Eligibility check complete`,
          `${checkResult.summary.eligible_count} eligible, ${checkResult.summary.borderline_count} borderline out of ${checkResult.summary.total_checked} programmes.`,
          `/results.html?session=${sessionToken}`]
      );
    }

    res.json({
      success:      true,
      session_token: sessionToken,
      ...checkResult
    });
  } catch (err) {
    console.error('Eligibility check error:', err);
    res.status(500).json({ success: false, message: 'Error running eligibility check.' });
  }
});

// GET /api/eligibility/session/:token — retrieve saved session results
router.get('/session/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const [sessions] = await pool.execute(
      'SELECT * FROM eligibility_sessions WHERE session_token = ?', [token]
    );
    if (!sessions.length) return res.status(404).json({ success: false, message: 'Session not found.' });

    const session = sessions[0];
    const [results] = await pool.execute(`
      SELECT er.*, p.programme_name, p.qualification_type, p.duration_years, p.fee_local, p.fee_intl,
             f.faculty_name, f.institution_id, i.name AS institution_name
      FROM eligibility_results er
      JOIN programmes p  ON er.programme_id = p.programme_id
      JOIN faculties f   ON p.faculty_id = f.faculty_id
      JOIN institutions i ON f.institution_id = i.institution_id
      WHERE er.session_id = ?
      ORDER BY er.eligibility_status, er.aps_calculated ASC
    `, [session.session_id]);

    const grouped = { eligible: [], borderline: [], not_eligible: [] };
    results.forEach(r => {
      const obj = {
        ...r,
        failed_requirements:     r.failed_requirements ? (typeof r.failed_requirements === 'string' ? JSON.parse(r.failed_requirements) : r.failed_requirements) : [],
        borderline_requirements: r.borderline_requirements ? (typeof r.borderline_requirements === 'string' ? JSON.parse(r.borderline_requirements) : r.borderline_requirements) : [],
        flags:                   r.flags ? (typeof r.flags === 'string' ? JSON.parse(r.flags) : r.flags) : []
      };
      if (r.eligibility_status === 'ELIGIBLE')     grouped.eligible.push(obj);
      else if (r.eligibility_status === 'BORDERLINE') grouped.borderline.push(obj);
      else grouped.not_eligible.push(obj);
    });

    res.json({
      success:  true,
      session:  { ...session, lgcse_results: typeof session.lgcse_results === 'string' ? JSON.parse(session.lgcse_results) : session.lgcse_results },
      ...grouped,
      summary: {
        eligible_count:     grouped.eligible.length,
        borderline_count:   grouped.borderline.length,
        not_eligible_count: grouped.not_eligible.length,
        total_checked:      results.length
      }
    });
  } catch (err) {
    console.error('Session fetch error:', err);
    res.status(500).json({ success: false, message: 'Error fetching session.' });
  }
});

// GET /api/eligibility/report/:token — download PDF
router.get('/report/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const [sessions] = await pool.execute('SELECT * FROM eligibility_sessions WHERE session_token = ?', [token]);
    if (!sessions.length) return res.status(404).json({ success: false, message: 'Session not found.' });

    const session = sessions[0];
    const lgcseResults = typeof session.lgcse_results === 'string' ? JSON.parse(session.lgcse_results) : session.lgcse_results;

    const [results] = await pool.execute(`
      SELECT er.*, p.programme_name, p.qualification_type, p.duration_years,
             f.faculty_name, f.institution_id, i.name AS institution_name
      FROM eligibility_results er
      JOIN programmes p  ON er.programme_id = p.programme_id
      JOIN faculties f   ON p.faculty_id = f.faculty_id
      JOIN institutions i ON f.institution_id = i.institution_id
      WHERE er.session_id = ?
    `, [session.session_id]);

    let user = null;
    if (session.user_id) {
      const [u] = await pool.execute('SELECT full_name, email FROM users WHERE user_id = ?', [session.user_id]);
      user = u[0] || null;
    }

    const eligible    = results.filter(r => r.eligibility_status === 'ELIGIBLE');
    const borderline  = results.filter(r => r.eligibility_status === 'BORDERLINE');
    const not_eligible = results.filter(r => r.eligibility_status === 'NOT_ELIGIBLE');

    generateEligibilityReport({
      user, lgcseResults, qualType: session.qual_type,
      summary: {
        eligible_count:     eligible.length,
        borderline_count:   borderline.length,
        not_eligible_count: not_eligible.length,
        total_checked:      results.length
      },
      eligible, borderline, not_eligible
    }, res);
  } catch (err) {
    console.error('PDF report error:', err);
    res.status(500).json({ success: false, message: 'Error generating PDF.' });
  }
});

// GET /api/eligibility/recommendations — smart recommendations for logged-in user's last session
router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    const [sessions] = await pool.execute(
      'SELECT * FROM eligibility_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.user.user_id]
    );
    if (!sessions.length)
      return res.json({ success: true, recommendations: [], message: 'No eligibility check found. Run a check first.' });

    const subjects = typeof sessions[0].lgcse_results === 'string' ? JSON.parse(sessions[0].lgcse_results) : sessions[0].lgcse_results;
    const recs     = await getRecommendations(subjects);
    res.json({ success: true, recommendations: recs });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ success: false, message: 'Error getting recommendations.' });
  }
});

// GET /api/eligibility/history — user's past eligibility sessions
router.get('/history', requireAuth, async (req, res) => {
  try {
    const [sessions] = await pool.execute(
      'SELECT * FROM eligibility_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.user_id]
    );
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching history.' });
  }
});

module.exports = router;
