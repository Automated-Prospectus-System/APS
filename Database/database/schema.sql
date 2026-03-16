-- APS System Database Schema for MySQL
-- Lesotho Higher Education Institutions & Programs

-- Create Universities Table
CREATE TABLE universities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL DEFAULT 'Lesotho',
    city VARCHAR(100),
    icon VARCHAR(50),
    description TEXT,
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    prospectus_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Faculties/Schools Table
CREATE TABLE faculties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    university_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_faculty (university_id, name),
    INDEX idx_university (university_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Programs Table
CREATE TABLE programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    university_id INT NOT NULL,
    faculty_id INT,
    name VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(100) NOT NULL,
    qualification_type VARCHAR(50) NOT NULL,
    duration_years INT,
    description TEXT,
    entry_requirements TEXT,
    compulsory_subjects JSON,
    subject_requirements JSON,
    minimum_score INT,
    admission_email VARCHAR(255),
    application_deadline DATE,
    programme_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL,
    INDEX idx_university (university_id),
    INDEX idx_field (field_of_study),
    INDEX idx_qualification (qualification_type),
    INDEX idx_faculty (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Subject Requirements Table
CREATE TABLE subject_requirements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    minimum_grade VARCHAR(5),
    is_compulsory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    INDEX idx_program (program_id),
    INDEX idx_subject (subject_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Eligibility Check Log (for analytics)
CREATE TABLE eligibility_checks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subjects_submitted JSON,
    total_score INT,
    eligible_programs_count INT,
    borderline_programs_count INT,
    not_eligible_programs_count INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Admin Users Table
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Data Sources Table (to track which prospectus/source each record came from)
CREATE TABLE data_sources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT,
    university_id INT,
    source_type VARCHAR(50),
    source_url VARCHAR(500),
    source_file VARCHAR(255),
    extraction_date DATE,
    last_verified DATE,
    data_quality_score INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE SET NULL,
    INDEX idx_source_type (source_type),
    INDEX idx_extraction_date (extraction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Fields of Study Reference Table
CREATE TABLE fields_of_study (
    id INT PRIMARY KEY AUTO_INCREMENT,
    field_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Qualification Types Reference Table
CREATE TABLE qualification_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    qualification_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Reference Data for Fields of Study
INSERT INTO fields_of_study (field_name, description) VALUES
('Engineering', 'Engineering and Technology programs'),
('Medicine', 'Medical and Health Sciences programs'),
('Business', 'Business, Commerce, and Management programs'),
('Education', 'Teacher Education and Pedagogy programs'),
('Law', 'Law and Legal Studies programs'),
('Science', 'Pure Sciences and Applied Sciences programs'),
('Humanities', 'Arts, Languages, and Social Studies'),
('Agriculture', 'Agricultural Sciences and Related Fields'),
('IT/Computer Science', 'Information Technology and Computing'),
('Environmental Science', 'Environmental Studies and Sustainability'),
('Arts', 'Fine Arts, Design, and Creative Programs'),
('Tourism & Hospitality', 'Tourism and Hospitality Management'),
('Social Sciences', 'Psychology, Sociology, and Social Studies');

-- Insert Reference Data for Qualification Types
INSERT INTO qualification_types (qualification_name, description) VALUES
('Certificate', 'Certificate Programmes (1-2 years)'),
('Diploma', 'Diploma Programmes (2-3 years)'),
('Bachelor', 'Bachelor Degree Programmes (3-4 years)'),
('Honours', 'Bachelor Honours Degree (4-5 years)'),
('Masters', 'Master Degree Programmes (1-2 years)'),
('PhD', 'Doctoral Degree Programmes'),
('Professional Certification', 'Professional Certification Programs');

-- Insert Initial Universities Data
INSERT INTO universities (name, country, city, icon, website, email, phone, description, prospectus_url) VALUES
('National University of Lesotho', 'Lesotho', 'Roma', 'fa-building', 'https://nul.ls/', 'admin@nul.ls', '+266 2201 2233', 'The premier public university in Lesotho with multiple faculties and research centers', 'https://nul.ls/download/printable-prospectus-2025-2026/'),
('Lerotholi Polytechnic', 'Lesotho', 'Maseru', 'fa-hammer', 'https://www.lp.ac.ls/', 'admissions@lp.ac.ls', '+266 2231 2000', 'Leading polytechnic offering vocational and technical programmes', 'https://www.lp.ac.ls/2024-applicants/'),
('Lesotho College of Education', 'Lesotho', 'Maseru', 'fa-graduation-cap', 'http://www.lce.ac.ls/', 'info@lce.ac.ls', '+266 2231 3200', 'Premier teacher education institution in Lesotho', 'https://www.lce.ac.ls/study-at-lce/'),
('Botho University Lesotho', 'Lesotho', 'Maseru', 'fa-university', 'https://lesotho.bothouniversity.com/', 'admissions@botho.ls', '+266 2231 3300', 'Private university offering business and technology programmes', 'https://lesotho.bothouniversity.com/downloads/prospectus/'),
('Limkokwing University of Creative Technology', 'Lesotho', 'Maseru', 'fa-palette', 'https://www.limkokwing.net/lesotho/', 'lesotho@limkokwing.net', '+266 2231 2800', 'Specialized institution for creative technology and design programmes', 'https://www.limkokwing.net/lesotho/academic/courses/'),
('African University College of Communications', 'Lesotho', 'Maseru', 'fa-microphone', 'https://www.aucc.ac.ls/', 'admissions@aucc.ac.ls', '+266 2223 1000', 'Specialist institution in communications, media, and journalism', 'https://www.aucc.ac.ls/');

-- Create view for easy program lookup with university info
CREATE VIEW programs_with_university AS
SELECT 
    p.id,
    p.name AS program_name,
    p.field_of_study,
    p.qualification_type,
    p.duration_years,
    p.minimum_score,
    p.compulsory_subjects,
    u.id AS university_id,
    u.name AS university_name,
    u.city,
    u.website,
    f.name AS faculty_name
FROM programs p
JOIN universities u ON p.university_id = u.id
LEFT JOIN faculties f ON p.faculty_id = f.id
ORDER BY u.name, p.name;

-- Summary view for dashboard
CREATE VIEW university_stats AS
SELECT 
    u.id,
    u.name,
    COUNT(DISTINCT p.id) AS total_programs,
    COUNT(DISTINCT CASE WHEN p.qualification_type = 'Bachelor' THEN p.id END) AS bachelor_programs,
    COUNT(DISTINCT CASE WHEN p.qualification_type = 'Diploma' THEN p.id END) AS diploma_programs,
    COUNT(DISTINCT CASE WHEN p.qualification_type = 'Certificate' THEN p.id END) AS certificate_programs,
    COUNT(DISTINCT f.id) AS total_faculties
FROM universities u
LEFT JOIN programs p ON u.id = p.university_id
LEFT JOIN faculties f ON u.id = f.university_id
GROUP BY u.id, u.name;
