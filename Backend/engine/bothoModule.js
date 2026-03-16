'use strict';
/**
 * Botho University Eligibility Module
 * Grading system: botho_points — HIGHER points = BETTER grade (OPPOSITE of NUL)
 * Accepts multi-country qualifications: LGCSE, NSC (SA), BGCSE (BW), NSSC (NA), GED (US), IB, A-Level
 */

const { pool } = require('../config/db');

// Botho points per LGCSE grade
const BOTHO_POINTS = { 'A*': 12, A: 11, B: 10, C: 8, D: 5, E: 4, F: 0, G: 0 };

// Multi-country grade → LGCSE equivalent → Botho points
const COUNTRY_GRADE_MAP = {
  NSC: {   // South Africa NSC
    '8': 'A*', '7': 'A', '6': 'B', '5': 'C', '4': 'D', '3': 'E', '2': 'F', '1': 'G',
    'A+': 'A', 'A': 'A', 'B': 'B', 'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E'
  },
  BGCSE: { // Botswana BGCSE
    'A': 'A*', 'B': 'A', 'C': 'B', 'D': 'C', 'E': 'D', 'F': 'E',
    'G': 'F', '1': 'G', '2': 'G',
    'A1': 'C', '1': 'C'  // Credit range
  },
  NSSC: {  // Namibia NSSC
    'A': 'A*', 'a': 'A', 'B': 'B', 'b': 'B', 'C': 'C', 'c': 'C',
    'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', '7': 'A*', '6': 'B'
  },
  GED: {   // USA GED score ranges stored as string bands
    '185-200': 'C', '175-184': 'C', '165-174': 'C',
    '155-164': 'D', '145-154': 'E', '0-144': 'F'
  },
  LGCSE: null  // Direct use
};

function toBothoPoints(grade, qualType = 'LGCSE') {
  if (qualType === 'LGCSE' || !qualType) {
    return BOTHO_POINTS[grade] ?? 0;
  }
  const map = COUNTRY_GRADE_MAP[qualType];
  if (!map) return BOTHO_POINTS[grade] ?? 0;
  const lgcseEquiv = map[grade];
  return lgcseEquiv ? (BOTHO_POINTS[lgcseEquiv] ?? 0) : 0;
}

const CREDIT_THRESHOLD = 8;  // C or better
const PASS_THRESHOLD   = 5;  // D or better

async function checkEligibility(programme, studentSubjects, qualType = 'LGCSE') {
  const result = {
    programme_id:            programme.programme_id,
    programme_name:          programme.programme_name,
    institution_id:          'BU',
    faculty_name:            programme.faculty_name,
    qualification_type:      programme.qualification_type,
    duration_years:          programme.duration_years,
    fee_local:               null,
    fee_intl:                null,
    eligibility_status:      null,
    aps_calculated:          null,
    aps_max_allowed:         null,
    failed_requirements:     [],
    borderline_requirements: [],
    flags:                   [],
    entry_type:              programme.entry_type
  };

  if (qualType !== 'LGCSE') {
    result.flags.push({ type: 'MULTI_QUAL', message: `Grades converted from ${qualType} to Botho points equivalent for assessment.` });
  }

  // RPL
  if (programme.entry_type === 'rpl') {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.flags.push({ type: 'RPL', message: 'Diploma/Higher Diploma holders may qualify for exemptions. Contact Botho Admissions: +266 59685313.' });
    return result;
  }

  // B1: Minimum 5 subjects (BU requires 5, not 6)
  const minSubj = programme.min_subjects_req || 5;
  if (studentSubjects.length < minSubj) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.failed_requirements.push({ reason: `Fewer than ${minSubj} subjects. You submitted ${studentSubjects.length}.` });
    return result;
  }

  // B2: English must be present
  if (!studentSubjects.some(s => s.subject_id === 'ENG')) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    result.failed_requirements.push({ subject: 'English Language', reason: 'English Language is missing from your results.' });
    return result;
  }

  const [reqs] = await pool.execute(
    'SELECT * FROM subject_requirements WHERE programme_id = ?',
    [programme.programme_id]
  );
  const [thresholds] = await pool.execute(
    'SELECT * FROM aps_thresholds WHERE programme_id = ?',
    [programme.programme_id]
  );
  const threshold = thresholds[0];

  // Convert student grades to Botho points
  const studentWithPoints = studentSubjects.map(s => ({
    ...s,
    botho_points: toBothoPoints(s.grade, qualType)
  }));

  // B3: Compulsory subject checks (Botho: HIGHER points = better)
  for (const req of reqs.filter(r => r.is_compulsory)) {
    const reqPts = toBothoPoints(req.min_grade, 'LGCSE');  // requirement always in LGCSE grades

    if (req.subject_group) {
      const group = typeof req.subject_group === 'string'
        ? JSON.parse(req.subject_group)
        : req.subject_group;

      const groupMatches = studentWithPoints.filter(s => group.includes(s.subject_id));
      if (groupMatches.length === 0) {
        result.failed_requirements.push({
          subject:        `One of: ${group.join(', ')}`,
          required_grade: req.min_grade,
          reason:         `Need at least one subject from [${group.join(', ')}] at ${req.min_grade} or better.`
        });
        continue;
      }

      const passing = groupMatches.filter(s => s.botho_points >= reqPts);
      if (passing.length === 0) {
        const best = groupMatches.reduce((a, b) => a.botho_points > b.botho_points ? a : b);
        result.failed_requirements.push({
          subject:        `One of: ${group.join(', ')}`,
          required_grade: req.min_grade,
          student_grade:  best.grade,
          reason:         `Best qualifying subject is ${best.subject_id} (${best.grade}). Need ${req.min_grade} or better.`
        });
      } else if (passing.every(s => s.botho_points === reqPts)) {
        result.borderline_requirements.push({
          subject:        passing[0].subject_id,
          required_grade: req.min_grade,
          student_grade:  passing[0].grade,
          reason:         'Grade exactly at minimum.'
        });
      }

    } else if (req.subject_id) {
      const subj = studentWithPoints.find(s => s.subject_id === req.subject_id);
      if (!subj) {
        result.failed_requirements.push({
          subject:        req.subject_id,
          required_grade: req.min_grade,
          reason:         `${req.subject_id} not found in results. Required at grade ${req.min_grade} or better.`
        });
      } else {
        if (subj.botho_points < reqPts) {
          result.failed_requirements.push({
            subject:        req.subject_id,
            required_grade: req.min_grade,
            student_grade:  subj.grade,
            reason:         `Grade below minimum. Need ${req.min_grade} (${reqPts} pts), you got ${subj.grade} (${subj.botho_points} pts).`
          });
        } else if (subj.botho_points === reqPts) {
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

  if (result.failed_requirements.length > 0) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    return result;
  }

  // B4: Credits count — at least min_credits_count subjects at C or better (≥8 Botho pts)
  // Use best 5 subjects by Botho points
  const best5 = [...studentWithPoints].sort((a, b) => b.botho_points - a.botho_points).slice(0, 5);
  const creditCount = best5.filter(s => s.botho_points >= CREDIT_THRESHOLD).length;
  const passCount   = best5.filter(s => s.botho_points >= PASS_THRESHOLD).length;

  if (threshold?.min_credits_count && creditCount < threshold.min_credits_count) {
    result.failed_requirements.push({
      reason: `Insufficient Credits (C grades): need ${threshold.min_credits_count} subjects at C or better (≥8 pts), you have ${creditCount} in your best 5 subjects.`
    });
  }

  // B5: Total passes — credits + passes combined must cover enough subjects
  const totalNeeded = (threshold?.min_credits_count || 3) + (threshold?.min_pass_count || 2);
  if (passCount < totalNeeded) {
    result.failed_requirements.push({
      reason: `Insufficient Passes: need ${totalNeeded} subjects at D or better across 5 subjects, you have ${passCount}.`
    });
  }

  if (result.failed_requirements.length > 0) {
    result.eligibility_status = 'NOT_ELIGIBLE';
    return result;
  }

  // B8: RPL flag for diploma holders
  result.flags.push({
    type: 'RPL',
    message: 'Holders of a Diploma or Higher Diploma in a related field may be eligible for credit exemptions. Contact Botho University Admissions: +266 59685313.'
  });

  result.eligibility_status = result.borderline_requirements.length > 0 ? 'BORDERLINE' : 'ELIGIBLE';
  return result;
}

module.exports = { checkEligibility };
