'use strict';
/**
 * LP Eligibility Module
 * Grading system: lp_grade_check — NO APS. Pure grade checks only.
 * Uses same NUL grade→points scale for comparison (lower = better).
 */

const { pool } = require('../config/db');

const GRADE_POINTS = { 'A*': 1, A: 2, B: 3, C: 4, D: 5, E: 6, F: 7, G: 8 };
function pts(grade) { return GRADE_POINTS[grade] ?? 9; }

// NMDS sponsorship threshold: C in Maths, PhysSci, English; D in 2 others
const NMDS_THRESHOLD = [
  { subject_id: 'MATH',    min_grade: 'C' },
  { subject_id: 'PHY_SCI', min_grade: 'C' },
  { subject_id: 'ENG',     min_grade: 'C' }
];

async function checkEligibility(programme, studentSubjects) {
  const result = {
    programme_id:            programme.programme_id,
    programme_name:          programme.programme_name,
    institution_id:          'LP',
    faculty_name:            programme.faculty_name,
    qualification_type:      programme.qualification_type,
    duration_years:          programme.duration_years,
    fee_local:               programme.fee_local,
    eligibility_status:      null,
    aps_calculated:          null,
    aps_max_allowed:         null,
    failed_requirements:     [],
    borderline_requirements: [],
    flags:                   [],
    entry_type:              programme.entry_type
  };

  // RPL route
  if (programme.entry_type === 'rpl') {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.flags.push({
      type: 'RPL',
      message: 'This programme (or a route within it) is available via Recognition of Prior Learning (RPL). Contact LP Admissions directly: admissions@lp.ac.ls'
    });
    return result;
  }

  // Indirect route
  if (programme.entry_type === 'indirect') {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.flags.push({
      type: 'INDIRECT_ENTRY',
      message: 'This entry route is based on prior qualifications (A-Level, IB, or diploma), not LGCSE grades. Contact LP Admissions for details.'
    });
    return result;
  }

  // L1: Minimum 6 subjects
  if (studentSubjects.length < 6) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.failed_requirements.push({ reason: `Fewer than 6 LGCSE subjects. You submitted ${studentSubjects.length}.` });
    return result;
  }

  // L2: English Language must be present
  if (!studentSubjects.some(s => s.subject_id === 'ENG')) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.failed_requirements.push({ subject: 'English Language', reason: 'English Language is missing from your results.' });
    return result;
  }

  const [reqs] = await pool.execute(
    'SELECT * FROM subject_requirements WHERE programme_id = ?',
    [programme.programme_id]
  );
  const [gradeRules] = await pool.execute(
    'SELECT * FROM programme_grade_rules WHERE programme_id = ?',
    [programme.programme_id]
  );

  // L3 + L4: Subject and group checks
  for (const req of reqs.filter(r => r.is_compulsory)) {
    const minPts = pts(req.min_grade);

    if (req.subject_group) {
      const group = typeof req.subject_group === 'string'
        ? JSON.parse(req.subject_group)
        : req.subject_group;

      const groupMatches = studentSubjects.filter(s => group.includes(s.subject_id));

      if (groupMatches.length === 0) {
        result.failed_requirements.push({
          subject:        `One of: ${group.join(', ')}`,
          required_grade: req.min_grade,
          reason:         `Need at least one subject from [${group.join(', ')}] at grade ${req.min_grade} or better.`
        });
        continue;
      }

      const passing = groupMatches.filter(s => pts(s.grade) <= minPts);
      if (passing.length === 0) {
        const best = groupMatches.reduce((a, b) => pts(a.grade) < pts(b.grade) ? a : b);
        result.failed_requirements.push({
          subject:        `One of: ${group.join(', ')}`,
          required_grade: req.min_grade,
          student_grade:  best.grade,
          reason:         `Best qualifying subject is ${best.subject_id} (${best.grade}). Need ${req.min_grade} or better.`
        });
      } else {
        const borderline = passing.filter(s => pts(s.grade) === minPts);
        if (borderline.length > 0 && borderline.length === passing.length) {
          result.borderline_requirements.push({
            subject:        borderline[0].subject_id,
            required_grade: req.min_grade,
            student_grade:  borderline[0].grade,
            reason:         'Grade exactly at minimum for group subject.'
          });
        }
      }

    } else if (req.subject_id) {
      const subj = studentSubjects.find(s => s.subject_id === req.subject_id);
      if (!subj) {
        result.failed_requirements.push({
          subject:        req.subject_id,
          required_grade: req.min_grade,
          reason:         `${req.subject_id} not found in results. Required at grade ${req.min_grade} or better.`
        });
      } else {
        const studentPts = pts(subj.grade);
        if (studentPts > minPts) {
          result.failed_requirements.push({
            subject:        req.subject_id,
            required_grade: req.min_grade,
            student_grade:  subj.grade,
            reason:         `Grade below minimum. Need ${req.min_grade}, you got ${subj.grade}.`
          });
        } else if (studentPts === minPts) {
          result.borderline_requirements.push({
            subject:        req.subject_id,
            required_grade: req.min_grade,
            student_grade:  subj.grade,
            reason:         'Grade exactly at minimum.'
          });
        }
      }
    }
  }

  // Grade count rules
  for (const rule of gradeRules) {
    const rulePts = pts(rule.min_grade);
    const qualifying = studentSubjects.filter(s => pts(s.grade) <= rulePts);
    if (qualifying.length < rule.min_count) {
      result.failed_requirements.push({
        reason: `${rule.notes || `Need at least ${rule.min_count} subjects at grade ${rule.min_grade} or better. You have ${qualifying.length}.`}`
      });
    }
  }

  // L5: NO APS calculation
  // result.aps_calculated remains null

  if (result.failed_requirements.length > 0) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    return result;
  }

  // L7: RPL flag for specific programmes
  if (['LP011', 'LP013'].includes(programme.programme_id)) {
    result.flags.push({
      type: 'RPL',
      message: 'RPL routes are available for this programme for applicants with prior trade qualifications. Contact LP Admissions.'
    });
  }

  // L8: Architecture portfolio + interview flag
  if (programme.programme_id === 'LP011' || programme.has_portfolio) {
    result.flags.push({
      type: 'PORTFOLIO',
      message: 'Bachelor of Architecture requires a Creative Portfolio submission demonstrating creativity and design ability (original work only). Shortlisted candidates are then invited for an Interview before final admission.'
    });
  }

  // L9: NMDS sponsorship flag for all LP degree programmes
  if (programme.qualification_type === 'degree') {
    const nmdsPass = NMDS_THRESHOLD.every(req => {
      const subj = studentSubjects.find(s => s.subject_id === req.subject_id);
      return subj && pts(subj.grade) <= pts(req.min_grade);
    });
    if (!nmdsPass) {
      result.flags.push({
        type: 'NMDS_WARNING',
        message: 'You meet LP admission requirements but may NOT meet NMDS (National Manpower Development Secretariat) sponsorship criteria, which requires C in Mathematics, C in Physical Science, and C in English. Check NMDS requirements if you are applying for government sponsorship.'
      });
    }
  }

  result.eligibility_status = result.borderline_requirements.length > 0 ? 'BORDERLINE' : 'ELIGIBLE';
  return result;
}

module.exports = { checkEligibility };
