const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5000';

// Shared email template wrapper
function wrapTemplate(title, content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0d1117; color: #e6edf3; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #161b22; border-radius: 12px; overflow: hidden; border: 1px solid #30363d; }
    .header { background: linear-gradient(135deg, #003580, #009A44); padding: 32px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px 40px; }
    .body h2 { color: #58a6ff; margin-top: 0; }
    .body p { color: #8b949e; line-height: 1.6; }
    .btn { display: inline-block; background: #009A44; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .badge-eligible { background: #1a4731; color: #3fb950; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .badge-borderline { background: #3d2e0c; color: #f0883e; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .footer { background: #0d1117; padding: 20px 40px; text-align: center; font-size: 12px; color: #484f58; border-top: 1px solid #21262d; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 10px 12px; text-align: left; border-bottom: 1px solid #21262d; font-size: 14px; }
    th { color: #58a6ff; background: #0d1117; }
    td { color: #c9d1d9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 APES</h1>
      <p>Automatic Prospectus & Eligibility System</p>
    </div>
    <div class="body">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>Covering NUL, Lerotholi Polytechnic & Botho University — Lesotho</p>
      <p>This is an automated message. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendWelcome(user) {
  const content = `
    <p>Hi <strong>${user.full_name}</strong>,</p>
    <p>Welcome to <strong>APES</strong> — your guide to university and college admissions in Lesotho! 🇱🇸</p>
    <p>With APES you can:</p>
    <ul style="color:#8b949e;">
      <li>Check your LGCSE eligibility for 100+ programmes across NUL, LP & Botho University</li>
      <li>Save and compare programmes side by side</li>
      <li>Track application deadlines</li>
      <li>Download printable eligibility reports</li>
    </ul>
    <a href="${BASE_URL}/dashboard.html" class="btn">Get Started →</a>`;
  try {
    await transporter.sendMail({
      from:    `"APES Admissions" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'Welcome to APES — Lesotho University Admissions Guide',
      html:    wrapTemplate('Welcome!', content)
    });
  } catch (err) {
    console.error('Email error (welcome):', err.message);
  }
}

async function sendEligibilityResults(user, summary, sessionToken) {
  const content = `
    <p>Hi <strong>${user.full_name}</strong>,</p>
    <p>Your eligibility check is complete. Here's a summary:</p>
    <table>
      <tr><th>Status</th><th>Count</th></tr>
      <tr><td><span class="badge-eligible">Eligible</span></td><td>${summary.eligible_count}</td></tr>
      <tr><td><span class="badge-borderline">Borderline</span></td><td>${summary.borderline_count}</td></tr>
      <tr><td>Not Eligible</td><td>${summary.not_eligible_count}</td></tr>
      <tr><td><strong>Total Programmes Checked</strong></td><td>${summary.total_checked}</td></tr>
    </table>
    <p>View your full results and download a PDF report:</p>
    <a href="${BASE_URL}/results.html?session=${sessionToken}" class="btn">View Full Results →</a>`;
  try {
    await transporter.sendMail({
      from:    `"APES Admissions" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: `Your APES Eligibility Results — ${summary.eligible_count} programmes eligible`,
      html:    wrapTemplate('Your Eligibility Results', content)
    });
  } catch (err) {
    console.error('Email error (eligibility):', err.message);
  }
}

async function sendPasswordReset(user, resetToken) {
  const resetUrl = `${BASE_URL}/reset-password.html?token=${resetToken}`;
  const content = `
    <p>Hi <strong>${user.full_name}</strong>,</p>
    <p>We received a request to reset your APES password.</p>
    <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}" class="btn">Reset Password →</a>
    <p style="font-size:12px;color:#484f58;">If you did not request a password reset, ignore this email.</p>`;
  try {
    await transporter.sendMail({
      from:    `"APES Admissions" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'Reset your APES password',
      html:    wrapTemplate('Password Reset', content)
    });
  } catch (err) {
    console.error('Email error (password reset):', err.message);
  }
}

async function sendDeadlineReminder(user, reminders) {
  const rows = reminders.map(r =>
    `<tr><td>${r.reminder_title}</td><td>${r.reminder_date}</td><td>${r.notes || '—'}</td></tr>`
  ).join('');
  const content = `
    <p>Hi <strong>${user.full_name}</strong>,</p>
    <p>You have upcoming application deadlines:</p>
    <table>
      <tr><th>Programme / Event</th><th>Date</th><th>Notes</th></tr>
      ${rows}
    </table>
    <a href="${BASE_URL}/dashboard.html" class="btn">View Dashboard →</a>`;
  try {
    await transporter.sendMail({
      from:    `"APES Admissions" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: `APES Reminder: ${reminders.length} upcoming deadline(s)`,
      html:    wrapTemplate('Upcoming Deadlines', content)
    });
  } catch (err) {
    console.error('Email error (deadline):', err.message);
  }
}

module.exports = { sendWelcome, sendEligibilityResults, sendPasswordReset, sendDeadlineReminder };
