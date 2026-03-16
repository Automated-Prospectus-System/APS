'use strict';
/**
 * Eligibility Engine Dispatcher
 * Routes each programme to the correct institution module.
 */

const nulModule   = require('./nulModule');
const lpModule    = require('./lpModule');
const bothoModule = require('./bothoModule');
const { pool }    = require('../config/db');

/**
 * Run eligibility check for a single student against all active programmes.
 * @param {Array}  studentSubjects  [{subject_id, grade}]
 * @param {string} qualType         'LGCSE'|'NSC'|'BGCSE'|'NSSC'|'GED'|'IB'|'ALEVEL'
 * @param {string} [filterInstitution] optional institution_id filter
 * @returns {object} { eligible, borderline, not_eligible, summary }
 */
async function runEligibilityCheck(studentSubjects, qualType = 'LGCSE', filterInstitution = null) {
  // Fetch all active direct programmes with faculty+institution data
  let query = `
    SELECT p.*, f.faculty_name, f.institution_id, i.grading_system, i.name AS institution_name
    FROM programmes p
    JOIN faculties f ON p.faculty_id = f.faculty_id
    JOIN institutions i ON f.institution_id = i.institution_id
    WHERE p.active = TRUE AND i.active = TRUE
  `;
  const params = [];

  if (filterInstitution) {
    const ids = Array.isArray(filterInstitution) ? filterInstitution : [filterInstitution];
    query += ` AND f.institution_id IN (${ids.map(() => '?').join(',')})`;
    params.push(...ids);
  }

  const [programmes] = await pool.execute(query, params);

  const results = { eligible: [], borderline: [], not_eligible: [] };

  await Promise.all(programmes.map(async (programme) => {
    try {
      let result;
      switch (programme.grading_system) {
        case 'nul_aps':
          result = await nulModule.checkEligibility(programme, studentSubjects);
          break;
        case 'lp_grade_check':
          result = await lpModule.checkEligibility(programme, studentSubjects);
          break;
        case 'botho_points':
          result = await bothoModule.checkEligibility(programme, studentSubjects, qualType);
          break;
        default:
          return;
      }
      result.institution_name = programme.institution_name;
      result.grading_system   = programme.grading_system;

      switch (result.eligibility_status) {
        case 'ELIGIBLE':    results.eligible.push(result);    break;
        case 'BORDERLINE':  results.borderline.push(result);  break;
        case 'NOT_ELIGIBLE':results.not_eligible.push(result);break;
      }
    } catch (err) {
      console.error(`Engine error for ${programme.programme_id}:`, err.message);
    }
  }));

  // Sort by APS (ascending = better for NUL), then name
  results.eligible.sort((a, b) => {
    if (a.aps_calculated !== null && b.aps_calculated !== null)
      return a.aps_calculated - b.aps_calculated;
    return a.programme_name.localeCompare(b.programme_name);
  });
  results.borderline.sort((a, b) => a.programme_name.localeCompare(b.programme_name));

  const summary = {
    eligible_count:     results.eligible.length,
    borderline_count:   results.borderline.length,
    not_eligible_count: results.not_eligible.length,
    total_checked:      programmes.length,
    qual_type:          qualType
  };

  return { ...results, summary };
}

/**
 * Check eligibility for a single programme.
 */
async function checkSingleProgramme(programmeId, studentSubjects, qualType = 'LGCSE') {
  const [rows] = await pool.execute(`
    SELECT p.*, f.faculty_name, f.institution_id, i.grading_system, i.name AS institution_name
    FROM programmes p
    JOIN faculties f ON p.faculty_id = f.faculty_id
    JOIN institutions i ON f.institution_id = i.institution_id
    WHERE p.programme_id = ? AND p.active = TRUE
  `, [programmeId]);

  if (!rows.length) return null;

  const programme = rows[0];
  switch (programme.grading_system) {
    case 'nul_aps':      return nulModule.checkEligibility(programme, studentSubjects);
    case 'lp_grade_check': return lpModule.checkEligibility(programme, studentSubjects);
    case 'botho_points': return bothoModule.checkEligibility(programme, studentSubjects, qualType);
    default: return null;
  }
}

/**
 * Smart Recommendations: return top 5 programmes where student's strongest
 * subjects match the programme's core requirements.
 */
async function getRecommendations(studentSubjects) {
  const allResults = await runEligibilityCheck(studentSubjects);
  const eligible = allResults.eligible;

  // Score programmes by how well the student exceeds requirements
  const scored = eligible.map(r => {
    let score = 0;
    if (r.aps_calculated !== null && r.aps_max_allowed !== null) {
      // NUL: lower APS is better — larger gap = more comfortable
      score = r.aps_max_allowed - r.aps_calculated;
    } else if (r.borderline_requirements.length === 0) {
      score = 10;
    }
    return { ...r, recommendation_score: score };
  });

  scored.sort((a, b) => b.recommendation_score - a.recommendation_score);
  return scored.slice(0, 10);
}

module.exports = { runEligibilityCheck, checkSingleProgramme, getRecommendations };
