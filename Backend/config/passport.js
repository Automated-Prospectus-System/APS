const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('./db');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email     = profile.emails[0].value;
    const googleId  = profile.id;
    const fullName  = profile.displayName;
    const photoUrl  = profile.photos?.[0]?.value || null;

    // Upsert user
    const [existing] = await pool.execute(
      'SELECT * FROM users WHERE google_id = ? OR email = ?',
      [googleId, email]
    );

    if (existing.length > 0) {
      const user = existing[0];
      await pool.execute(
        'UPDATE users SET google_id=?, last_login=NOW(), profile_photo_url=COALESCE(profile_photo_url,?) WHERE user_id=?',
        [googleId, photoUrl, user.user_id]
      );
      return done(null, { ...user, google_id: googleId });
    }

    // New user
    const [result] = await pool.execute(
      `INSERT INTO users (email, full_name, google_id, profile_photo_url, email_verified, last_login)
       VALUES (?, ?, ?, ?, TRUE, NOW())`,
      [email, fullName, googleId, photoUrl]
    );

    const [newUser] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [result.insertId]
    );

    // Send welcome notification
    await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, 'welcome', 'Welcome to APES!', ?)`,
      [result.insertId, `Hi ${fullName}! Your account has been created. Start by checking your eligibility for university programmes.`]
    );

    return done(null, newUser[0]);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.user_id));

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [id]);
    done(null, rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
