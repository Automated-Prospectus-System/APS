'use strict';
/**
 * NUL Eligibility Module
 * Grading system: nul_aps  — LOWER points = BETTER grade (A*=1, G=8)
 * APS = sum of best 6 subjects. APS ≤ threshold required.
 */

const { pool } = require('../config/db');

// NUL grade → points (lower is better)
const GRADE_POINTS = { 'A*': 1, A: 2, B: 3, C: 4, D: 5, E: 6, F: 7, G: 8 };

function pts(grade) { return GRADE_POINTS[grade] ?? 9; }

/**
 * @param {object} programme  - row from programmes + faculties join
 * @param {Array}  studentSubjects - [{subject_id, grade}]
 * @returns {object} eligibility result
 */
async function checkEligibility(programme, studentSubjects) {
  const result = {
    programme_id:            programme.programme_id,
    programme_name:          programme.programme_name,
    institution_id:          'NUL',
    faculty_name:            programme.faculty_name,
    qualification_type:      programme.qualification_type,
    duration_years:          programme.duration_years,
    fee_local:               programme.fee_local,
    fee_intl:                programme.fee_intl,
    eligibility_status:      null,
    aps_calculated:          null,
    aps_max_allowed:         null,
    failed_requirements:     [],
    borderline_requirements: [],
    flags:                   [],
    entry_type:              programme.entry_type
  };

  // Indirect / RPL / gateway downstream — skip LGCSE checks
  if (programme.entry_type === 'indirect' || programme.entry_type === 'rpl') {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.flags.push({
      type: 'INDIRECT_ENTRY',
      message: 'This is an indirect-entry programme. Entry is based on prior qualifications (diploma/degree), not LGCSE grades. Contact NUL Admissions for details.'
    });
    return result;
  }

  if (programme.entry_type === 'odl') {
    result.flags.push({ type: 'ODL', message: 'This is an Open Distance Learning (part-time) programme offered through the Institute of Extra Mural Studies (IEMS).' });
  }

  // Gateway downstream programmes
  if (programme.entry_type === 'direct' && programme.gateway_for === null && programme.is_gateway_prog === 0) {
    // Check if this programme itself requires gateway completion (stored in condition_note)
    // This is handled below via subject_requirements
  }

  // N1: Minimum 6 subjects
  if (studentSubjects.length < 6) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.failed_requirements.push({ reason: `Fewer than 6 LGCSE subjects provided. You submitted ${studentSubjects.length}.` });
    return result;
  }

  // N2: English Language must be present
  const hasEnglish = studentSubjects.some(s => s.subject_id === 'ENG');
  if (!hasEnglish) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.failed_requirements.push({ subject: 'English Language', reason: 'English Language is missing from your results.' });
    return result;
  }

  // Fetch requirements
  const [reqs] = await pool.execute(
    'SELECT * FROM subject_requirements WHERE programme_id = ? ORDER BY is_compulsory DESC, rank_order ASC',
    [programme.programme_id]
  );
  const [gradeRules] = await pool.execute(
    'SELECT * FROM programme_grade_rules WHERE programme_id = ?',
    [programme.programme_id]
  );
  const [thresholds] = await pool.execute(
    'SELECT * FROM aps_thresholds WHERE programme_id = ?',
    [programme.programme_id]
  );
  const threshold = thresholds[0];

  // N3: Check each compulsory subject requirement
  for (const req of reqs.filter(r => r.is_compulsory && !r.is_ranking)) {
    const minPts = pts(req.min_grade);

    if (req.subject_group) {
      // OR group — student must satisfy at least ONE subject in the group
      const group = typeof req.subject_group === 'string'
        ? JSON.parse(req.subject_group)
        : req.subject_group;

      const groupMatches = studentSubjects.filter(s => group.includes(s.subject_id));

      if (groupMatches.length === 0) {
        result.failed_requirements.push({
          subject:        `One of: ${group.join(', ')}`,
          required_grade: req.min_grade,
          reason:         req.condition_note || `Need at least one subject from [${group.join(', ')}] at grade ${req.min_grade} or better.`
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
      // Single subject check
      const subj = studentSubjects.find(s => s.subject_id === req.subject_id);

      if (!subj) {
        // Conditional requirements (only if specialisation chosen) — skip if noted
        if (req.condition_note && /only if|conditional/i.test(req.condition_note)) {
          result.flags.push({ type: 'CONDITIONAL', message: `Conditional requirement: ${req.condition_note}` });
          continue;
        }
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
            reason:         'Grade is exactly at the minimum required.'
          });
        }
      }
    }
  }

  // N4: Grade count rules
  for (const rule of gradeRules) {
    const rulePts = pts(rule.min_grade);
    const qualifying = studentSubjects.filter(s => pts(s.grade) <= rulePts);
    if (qualifying.length < rule.min_count) {
      result.failed_requirements.push({
        reason: `${rule.notes || `Need at least ${rule.min_count} subjects at grade ${rule.min_grade} or better. You have ${qualifying.length}.`}`
      });
    }
  }

  if (result.failed_requirements.length > 0) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    return result;
  }

  // N5: Calculate APS — sum of best 6 subjects
  const sorted = [...studentSubjects].sort((a, b) => pts(a.grade) - pts(b.grade)).slice(0, 6);
  result.aps_calculated = sorted.reduce((sum, s) => sum + pts(s.grade), 0);

  // N6: APS threshold check
  if (threshold?.aps_max) {
    result.aps_max_allowed = threshold.aps_max;
    if (result.aps_calculated > threshold.aps_max) {
      result.eligibility_status = 'NOT_ELIGIBLE';
      result.failed_requirements.push({
        reason: `APS of ${result.aps_calculated} exceeds the maximum of ${threshold.aps_max} for this programme.`
      });
      return result;
    }
    if (result.aps_calculated === threshold.aps_max) {
      result.borderline_requirements.push({
        reason: `Your APS of ${result.aps_calculated} is exactly at the threshold of ${threshold.aps_max}. Admission is competitive at this score.`
      });
    }
  }

  // Ranking subjects flag
  const rankingReqs = reqs.filter(r => r.is_ranking);
  if (rankingReqs.length > 0) {
    const rankLabels = rankingReqs
      .sort((a, b) => (a.rank_order || 99) - (b.rank_order || 99))
      .map(r => r.subject_id);
    result.flags.push({ type: 'RANKING', message: `Tie-breaking subjects (in order): ${rankLabels.join(' → ')}` });
  }

  // Gateway programme flag
  if (programme.is_gateway_prog) {
    result.flags.push({
      type: 'GATEWAY',
      message: 'This is the BSc General gateway programme. Students who successfully complete Year 1 may proceed to specialised BSc programmes (Biology, Chemistry, Mathematics, Physics, Computer Science, Environmental Science).'
    });
  }

  result.eligibility_status = result.borderline_requirements.length > 0 ? 'BORDERLINE' : 'ELIGIBLE';
  return result;
}

module.exports = { checkEligibility };
