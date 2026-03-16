require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const session       = require('express-session');
const rateLimit     = require('express-rate-limit');
const path          = require('path');
const bcrypt        = require('bcryptjs');
const passport      = require('./config/passport');
const { pool, testConnection } = require('./config/db');

const authRoutes        = require('./routes/auth');
const eligibilityRoutes = require('./routes/eligibility');
const institutionRoutes = require('./routes/institutions');
const programmeRoutes   = require('./routes/programmes');
const userRoutes        = require('./routes/users');
const adminRoutes       = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ─────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,  // disabled so inline scripts work in dev
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.use(session({
  secret:            process.env.SESSION_SECRET || 'apes-session-secret',
  resave:            false,
  saveUninitialized: false,
  cookie:            { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Rate Limiting ─────────────────────────────────────────────
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20,  message: { success: false, message: 'Too many auth attempts.' } });

app.use('/api/', apiLimiter);
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/eligibility',  eligibilityRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/programmes',   programmeRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/admin',        adminRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbOk = await testConnection();
  res.json({
    success: true,
    version: '2.0.0',
    name:    'APS — Automatic Prospectus & Eligibility System',
    db:      dbOk ? 'connected' : 'disconnected',
    env:     process.env.NODE_ENV
  });
});

// ── Subjects reference list ───────────────────────────────────
app.get('/api/subjects', async (req, res) => {
  try {
    const [subjects] = await pool.execute('SELECT * FROM subjects ORDER BY subject_name');
    res.json({ success: true, data: subjects });
  } catch {
    res.status(500).json({ success: false });
  }
});

// ── Static Frontend ───────────────────────────────────────────
const FRONTEND = path.join(__dirname, '..', 'Frontend');
app.use(express.static(FRONTEND));

// SPA-style fallback for HTML pages
app.get('*.html', (req, res) => {
  const page = path.join(FRONTEND, req.path);
  res.sendFile(page, err => {
    if (err) res.redirect('/login.html');
  });
});

app.get('/', (req, res) => res.redirect('/login.html'));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ── Admin seed ────────────────────────────────────────────────
async function seedAdmin() {
  try {
    const [existing] = await pool.execute("SELECT user_id FROM users WHERE email = ?", [process.env.ADMIN_EMAIL]);
    if (existing.length) return;
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await pool.execute(
      `INSERT INTO users (email, password_hash, full_name, role, email_verified) VALUES (?, ?, ?, 'admin', TRUE)`,
      [process.env.ADMIN_EMAIL, hash, process.env.ADMIN_NAME]
    );
    console.log(`✅ Admin seeded: ${process.env.ADMIN_EMAIL}`);
  } catch (err) {
    console.error('Admin seed error:', err.message);
  }
}

// ── Start ─────────────────────────────────────────────────────
async function start() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('\n❌ Cannot connect to MySQL. Ensure apes_system database exists.');
    console.error('   Run:  mysql -u root -p < ../Database/schema.sql && mysql -u root -p apes_system < ../Database/seed.sql\n');
    process.exit(1);
  }

  await seedAdmin();

  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║    APS — Automatic Prospectus & Eligibility System  ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  URL:   http://localhost:${PORT}                      ║`);
    console.log(`║  API:   http://localhost:${PORT}/api                  ║`);
    console.log(`║  Mode:  ${process.env.NODE_ENV}                           ║`);
    console.log('╚══════════════════════════════════════════════════╝\n');
  });
}

start();
