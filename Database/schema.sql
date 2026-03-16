-- ============================================================
-- APES: Automatic Prospectus & Eligibility System
-- Database Schema v2.0
-- Drops old aps_system, creates apes_system
-- ============================================================

USE apes_system;

-- ============================================================
-- INSTITUTION & STRUCTURE TABLES
-- ============================================================

CREATE TABLE institutions (
  institution_id   VARCHAR(10)  PRIMARY KEY NOT NULL,
  name             VARCHAR(100) NOT NULL,
  type             ENUM('public_university','public_polytechnic','private_university') NOT NULL,
  grading_system   ENUM('nul_aps','lp_grade_check','botho_points') NOT NULL,
  location         VARCHAR(100) NOT NULL,
  website          VARCHAR(200),
  email            VARCHAR(150),
  phone            VARCHAR(50),
  app_fee_local    DECIMAL(10,2),
  app_fee_intl     DECIMAL(10,2),
  app_deadline     VARCHAR(100),
  description      TEXT,
  logo_url         VARCHAR(300),
  active           BOOLEAN DEFAULT TRUE
);

CREATE TABLE faculties (
  faculty_id       VARCHAR(10)  PRIMARY KEY NOT NULL,
  institution_id   VARCHAR(10)  NOT NULL,
  faculty_name     VARCHAR(150) NOT NULL,
  notes            TEXT,
  FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE CASCADE
);

CREATE TABLE programmes (
  programme_id         VARCHAR(10)  PRIMARY KEY NOT NULL,
  faculty_id           VARCHAR(10)  NOT NULL,
  programme_name       VARCHAR(200) NOT NULL,
  qualification_type   ENUM('degree','diploma','certificate','honours') NOT NULL,
  duration_years       DECIMAL(3,1) NOT NULL,
  entry_type           ENUM('direct','indirect','rpl','odl') NOT NULL,
  min_subjects_req     TINYINT NOT NULL DEFAULT 6,
  has_portfolio        BOOLEAN DEFAULT FALSE,
  has_interview        BOOLEAN DEFAULT FALSE,
  is_gateway_prog      BOOLEAN DEFAULT FALSE,
  gateway_for          TEXT,
  fee_local            DECIMAL(10,2),
  fee_intl             DECIMAL(10,2),
  description          TEXT,
  career_prospects     TEXT,
  active               BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (faculty_id) REFERENCES faculties(faculty_id) ON DELETE CASCADE
);

CREATE TABLE subjects (
  subject_id    VARCHAR(20)  PRIMARY KEY NOT NULL,
  subject_name  VARCHAR(100) NOT NULL UNIQUE,
  is_science    BOOLEAN DEFAULT FALSE,
  is_language   BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- GRADING TABLES
-- ============================================================

-- NUL 8-point scale: LOWER points = BETTER grade
CREATE TABLE grade_points_nul (
  grade          ENUM('A*','A','B','C','D','E','F','G') PRIMARY KEY NOT NULL,
  points_value   TINYINT NOT NULL,
  mark_range     VARCHAR(20),
  interpretation VARCHAR(50)
);

-- Botho multi-qualification points: HIGHER points = BETTER grade
CREATE TABLE grade_points_botho (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  lgcse_grade     ENUM('A*','A','B','C','D','E','F','G') NOT NULL,
  botho_points    TINYINT NOT NULL,
  south_africa    VARCHAR(30),
  botswana        VARCHAR(30),
  namibia         VARCHAR(30),
  usa_ged         VARCHAR(30),
  INDEX idx_lgcse (lgcse_grade)
);

-- ============================================================
-- REQUIREMENTS TABLES
-- ============================================================

CREATE TABLE subject_requirements (
  req_id          INT AUTO_INCREMENT PRIMARY KEY,
  programme_id    VARCHAR(10) NOT NULL,
  subject_id      VARCHAR(20),
  subject_group   JSON,
  min_grade       ENUM('A*','A','B','C','D','E','F','G') NOT NULL,
  is_compulsory   BOOLEAN NOT NULL DEFAULT TRUE,
  is_ranking      BOOLEAN DEFAULT FALSE,
  condition_note  TEXT,
  req_group_tag   VARCHAR(50),
  rank_order      TINYINT,
  FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id)   REFERENCES subjects(subject_id) ON DELETE SET NULL,
  INDEX idx_prog (programme_id)
);

-- Count-based grade rules (e.g. "need at least 4 subjects at C or better")
CREATE TABLE programme_grade_rules (
  rule_id       INT AUTO_INCREMENT PRIMARY KEY,
  programme_id  VARCHAR(10) NOT NULL,
  min_grade     ENUM('A*','A','B','C','D','E','F','G') NOT NULL,
  min_count     TINYINT NOT NULL,
  notes         TEXT,
  FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE,
  INDEX idx_prog (programme_id)
);

-- APS / credit-pass thresholds per programme
CREATE TABLE aps_thresholds (
  threshold_id       INT AUTO_INCREMENT PRIMARY KEY,
  programme_id       VARCHAR(10) NOT NULL UNIQUE,
  aps_max            TINYINT,
  aps_min            TINYINT,
  min_credits_count  TINYINT,
  min_pass_count     TINYINT,
  notes              TEXT,
  FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE
);

-- ============================================================
-- USER TABLES
-- ============================================================

CREATE TABLE users (
  user_id                INT AUTO_INCREMENT PRIMARY KEY,
  email                  VARCHAR(150) NOT NULL UNIQUE,
  username               VARCHAR(50)  UNIQUE,
  password_hash          VARCHAR(255),
  full_name              VARCHAR(150) NOT NULL,
  phone                  VARCHAR(20),
  date_of_birth          DATE,
  school_name            VARCHAR(200),
  grade_level            VARCHAR(50),
  country                VARCHAR(50)  DEFAULT 'Lesotho',
  city                   VARCHAR(100),
  profile_photo_url      VARCHAR(500),
  profile_photo_public_id VARCHAR(200),
  google_id              VARCHAR(100) UNIQUE,
  role                   ENUM('student','admin','staff') DEFAULT 'student',
  is_active              BOOLEAN DEFAULT TRUE,
  email_verified         BOOLEAN DEFAULT FALSE,
  email_notifications    BOOLEAN DEFAULT TRUE,
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login             TIMESTAMP NULL,
  INDEX idx_email  (email),
  INDEX idx_google (google_id)
);

CREATE TABLE eligibility_sessions (
  session_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT,
  session_token   VARCHAR(100) NOT NULL UNIQUE,
  lgcse_results   JSON NOT NULL,
  qual_type       ENUM('LGCSE','NSC','BGCSE','NSSC','GED','IB','ALEVEL') DEFAULT 'LGCSE',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_user  (user_id),
  INDEX idx_token (session_token)
);

CREATE TABLE eligibility_results (
  result_id              INT AUTO_INCREMENT PRIMARY KEY,
  session_id             INT NOT NULL,
  programme_id           VARCHAR(10) NOT NULL,
  eligibility_status     ENUM('ELIGIBLE','BORDERLINE','NOT_ELIGIBLE') NOT NULL,
  aps_calculated         TINYINT,
  aps_max_allowed        TINYINT,
  failed_requirements    JSON,
  borderline_requirements JSON,
  flags                  JSON,
  entry_type             VARCHAR(20),
  FOREIGN KEY (session_id)   REFERENCES eligibility_sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE,
  INDEX idx_session (session_id),
  INDEX idx_status  (eligibility_status)
);

CREATE TABLE saved_programmes (
  save_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  programme_id  VARCHAR(10) NOT NULL,
  notes         TEXT,
  saved_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_prog (user_id, programme_id),
  FOREIGN KEY (user_id)      REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE
);

CREATE TABLE deadline_reminders (
  reminder_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  programme_id     VARCHAR(10),
  institution_id   VARCHAR(10),
  reminder_date    DATE NOT NULL,
  reminder_title   VARCHAR(200) NOT NULL,
  notes            TEXT,
  email_sent       BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  notif_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  type        ENUM('eligibility','deadline','system','welcome','password_reset') NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  link        VARCHAR(300),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_read (is_read)
);

CREATE TABLE password_resets (
  reset_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token       VARCHAR(200) NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
  log_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT,
  action       VARCHAR(100) NOT NULL,
  entity_type  VARCHAR(50),
  entity_id    VARCHAR(50),
  details      JSON,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
