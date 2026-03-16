-- ============================================================
-- APES: Automatic Prospectus & Eligibility System
-- Seed Data v2.0 — NUL + LP + BU
-- Run AFTER schema.sql
-- ============================================================
USE apes_system;

-- ============================================================
-- GRADE POINTS
-- ============================================================

INSERT INTO grade_points_nul (grade, points_value, mark_range, interpretation) VALUES
('A*', 1, '90-100', 'Distinction Outstanding'),
('A',  2, '80-89',  'Distinction'),
('B',  3, '70-79',  'Merit'),
('C',  4, '60-69',  'Credit'),
('D',  5, '50-59',  'Pass'),
('E',  6, '40-49',  'Marginal Pass'),
('F',  7, '30-39',  'Fail'),
('G',  8, '0-29',   'Fail');

INSERT INTO grade_points_botho (lgcse_grade, botho_points, south_africa, botswana, namibia, usa_ged) VALUES
('A*', 12, 'A (90-100%)', 'A (80-100%)', 'A (80-100%)', 'N/A'),
('A',  11, 'A (80-89%)',  'B (70-79%)',  'B (70-79%)',  'GED 580-800'),
('B',  10, 'B (70-79%)',  'C (60-69%)',  'C (60-69%)',  'GED 520-579'),
('C',   8, 'C (60-69%)',  'C (50-59%)',  'C (50-59%)',  'GED 450-519'),
('D',   5, 'D (50-59%)',  'D (40-49%)',  'D (40-49%)',  'GED 410-449'),
('E',   4, 'E (40-49%)',  'E (30-39%)',  'E (30-39%)',  'GED 400-409'),
('F',   0, 'F (<40%)',    'F (<30%)',    'F (<30%)',    '<400'),
('G',   0, 'G (<30%)',    'G (<20%)',    'G (<20%)',    '<400');

-- ============================================================
-- INSTITUTIONS
-- ============================================================

INSERT INTO institutions (institution_id, name, type, grading_system, location, website, email, phone, app_fee_local, app_fee_intl, app_deadline, description, logo_url) VALUES
('NUL', 'National University of Lesotho', 'public_university', 'nul_aps',
 'Roma, Lesotho', 'https://nul.ls', 'admissions@nul.ls', '+266 2201 2233',
 50.00, 150.00, 'Applications close 31 October each year',
 'The premier public university of Lesotho, founded in 1975. NUL offers undergraduate and postgraduate programmes across Agriculture, Education, Health Sciences, Humanities, Law, Science & Technology, and Social Sciences.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/National_University_of_Lesotho_logo.svg/200px-National_University_of_Lesotho_logo.svg.png'),

('LP', 'Lerotholi Polytechnic', 'public_polytechnic', 'lp_grade_check',
 'Maseru, Lesotho', 'https://www.lp.ac.ls', 'admissions@lp.ac.ls', '+266 2231 2000',
 30.00, 100.00, 'Applications open January; close March each year',
 'Lesotho''s leading polytechnic institution specialising in engineering, architecture, built environment, and technical vocational programmes. Established in 1905, LP trains skilled professionals for Lesotho''s development.',
 'https://www.lp.ac.ls/wp-content/uploads/2019/01/logo1.png'),

('BU', 'Botho University Lesotho', 'private_university', 'botho_points',
 'Maseru, Lesotho', 'https://lesotho.bothouniversity.com', 'admissions.ls@botho.ls', '+266 2231 3300',
 100.00, 250.00, 'Rolling admissions — apply any time',
 'A leading private university offering cutting-edge programmes in IT, Business, Accounting, and Health Information Management. Botho University is accredited by the Council on Higher Education of Lesotho.',
 'https://lesotho.bothouniversity.com/wp-content/uploads/sites/4/2022/08/logo-300x300.png');

-- ============================================================
-- SUBJECTS
-- ============================================================

INSERT INTO subjects (subject_id, subject_name, is_science, is_language) VALUES
('ENG',    'English Language',          FALSE, TRUE),
('MATH',   'Mathematics',               FALSE, FALSE),
('BIO',    'Biology',                   TRUE,  FALSE),
('CHEM',   'Chemistry',                 TRUE,  FALSE),
('PHYS',   'Physics',                   TRUE,  FALSE),
('GEOG',   'Geography',                 FALSE, FALSE),
('HIST',   'History',                   FALSE, FALSE),
('ECON',   'Economics',                 FALSE, FALSE),
('ACCNT',  'Accounting',                FALSE, FALSE),
('BSTUD',  'Business Studies',          FALSE, FALSE),
('ARTD',   'Art & Design',              FALSE, FALSE),
('AGRI',   'Agriculture',               FALSE, FALSE),
('RELST',  'Religious Studies',         FALSE, FALSE),
('COMPST', 'Computer Studies',          FALSE, FALSE),
('SESO',   'Sesotho',                   FALSE, TRUE),
('DEVST',  'Development Studies',       FALSE, FALSE),
('PE',     'Physical Education',        FALSE, FALSE),
('FOOD',   'Food & Nutrition',          FALSE, FALSE),
('COMM',   'Commerce',                  FALSE, FALSE),
('TDRAW',  'Technical Drawing',         FALSE, FALSE),
('LIT',    'Literature in English',     FALSE, TRUE),
('FREN',   'French',                    FALSE, TRUE),
('PHYSCI', 'Physical Science',          TRUE,  FALSE),
('TDARTS', 'Technical Arts',            FALSE, FALSE);

-- ============================================================
-- FACULTIES
-- ============================================================

-- NUL Faculties
INSERT INTO faculties (faculty_id, institution_id, faculty_name, notes) VALUES
('NUL_FA',  'NUL', 'Faculty of Agriculture', 'Covers crop science, soil science, animal science, range management and food science'),
('NUL_FED', 'NUL', 'Faculty of Education',   'Prepares teachers for primary and secondary schools; also offers special education'),
('NUL_FHS', 'NUL', 'Faculty of Health Sciences', 'Nursing, Pharmacy, Environmental Health, Medical Laboratory Sciences'),
('NUL_FHU', 'NUL', 'Faculty of Humanities',  'Languages, Communication, Arts, Social Sciences, History'),
('NUL_FL',  'NUL', 'Faculty of Law',          'LLB covering constitutional, criminal, commercial and customary law'),
('NUL_FST', 'NUL', 'Faculty of Science & Technology', 'Mathematics, Physics, Chemistry, Biology, Computer Science, Geography'),
('NUL_FSS', 'NUL', 'Faculty of Social Sciences', 'Economics, Sociology, Social Work, Public Administration, Political Science');

-- LP Schools
INSERT INTO faculties (faculty_id, institution_id, faculty_name, notes) VALUES
('LP_SE',   'LP',  'School of Engineering', 'Civil, Electrical, Mechanical, Irrigation & Drainage engineering programmes'),
('LP_SABE', 'LP',  'School of Architecture & Built Environment', 'Architecture, Architectural Technology, Quantity Surveying, Land Surveying'),
('LP_SBM',  'LP',  'School of Business & Management', 'Business management, accounting, secretarial programmes'),
('LP_SC',   'LP',  'School of Computing', 'Computer studies, IT, business computing');

-- BU Schools
INSERT INTO faculties (faculty_id, institution_id, faculty_name, notes) VALUES
('BU_SCT',  'BU',  'School of Computing & Technology', 'Computing, IT, and technology programmes'),
('BU_SB',   'BU',  'School of Business', 'Business administration, accounting, HR, marketing, health information');

-- ============================================================
-- PROGRAMMES — NUL
-- ============================================================

-- Faculty of Agriculture
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('N001', 'NUL_FA', 'Bachelor of Science in Agriculture', 'degree', 4, 'direct', 6,
 'Comprehensive programme covering crop science, soil science, animal science, and agricultural economics.',
 'Agricultural officer, farm manager, agribusiness consultant, development agency, NGO, Ministry of Agriculture'),
('N002', 'NUL_FA', 'Bachelor of Science in Agricultural Economics', 'degree', 4, 'direct', 6,
 'Combines agricultural sciences with economic principles covering farm management, agribusiness and rural development.',
 'Agribusiness manager, development economist, rural development officer, banking and finance'),
('N003', 'NUL_FA', 'Bachelor of Science in Consumer Science', 'degree', 4, 'direct', 6,
 'Focuses on food science, nutrition, textile science and family resource management.',
 'Food industry, retail management, consumer advocacy, home economics educator'),
('N004', 'NUL_FA', 'Bachelor of Science in Range Resources & Ecology', 'degree', 4, 'direct', 6,
 'Studies range management, wildlife ecology, environmental conservation and natural resource management.',
 'Range ecologist, conservation officer, NGO, Ministry of Forestry and Land Reclamation'),
('N005', 'NUL_FA', 'Bachelor of Science in Food Science & Nutrition', 'degree', 4, 'direct', 6,
 'Studies food composition, food processing, nutrition science and public health nutrition.',
 'Food technologist, nutritionist, quality assurance officer, public health officer'),
('N006', 'NUL_FA', 'Diploma in Agriculture', 'diploma', 3, 'direct', 5,
 'Practical training in crop production, livestock management, and agricultural extension.',
 'Agricultural technician, extension officer, cooperative manager, rural development');

-- Faculty of Health Sciences
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('N007', 'NUL_FHS', 'Bachelor of Science in Nursing & Midwifery', 'degree', 4, 'direct', 6,
 'Comprehensive nursing education combining theoretical and clinical training in hospitals and community settings.',
 'Registered nurse, midwife, community health nurse, nurse educator, clinic manager'),
('N008', 'NUL_FHS', 'Bachelor of Pharmacy', 'degree', 5, 'direct', 6,
 'Prepares students for careers in pharmaceutical sciences, drug dispensing, and pharmaceutical research.',
 'Pharmacist, pharmaceutical researcher, drug regulatory officer, pharmacy manager'),
('N009', 'NUL_FHS', 'Bachelor of Science in Environmental Health', 'degree', 4, 'direct', 6,
 'Focuses on public health, environmental sanitation, occupational health and disease prevention.',
 'Environmental health officer, public health inspector, occupational health specialist'),
('N010', 'NUL_FHS', 'Bachelor of Science in Medical Laboratory Sciences', 'degree', 4, 'direct', 6,
 'Training in clinical laboratory techniques, diagnostics, haematology, microbiology and biochemistry.',
 'Medical laboratory scientist, clinical researcher, pathology laboratory manager'),
('N011', 'NUL_FHS', 'Diploma in Pharmaceutical Technology', 'diploma', 3, 'direct', 5,
 'Practical pharmaceutical training in drug compounding, quality assurance, and pharmacy support.',
 'Pharmacy technician, pharmaceutical technologist, hospital dispensary technician');

-- Faculty of Law
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('N012', 'NUL_FL', 'Bachelor of Laws (LLB)', 'degree', 4, 'direct', 6,
 'Rigorous legal education covering constitutional, criminal, civil procedure, commercial and customary law.',
 'Advocate, solicitor, magistrate, legal advisor, state counsel, corporate lawyer');

-- Faculty of Education
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('N013', 'NUL_FED', 'Bachelor of Education (Primary)', 'degree', 4, 'direct', 6,
 'Prepares competent primary school teachers with two subject specialisations and extensive school practice.',
 'Primary school teacher, primary school head, curriculum developer, education officer'),
('N014', 'NUL_FED', 'Bachelor of Education (Secondary)', 'degree', 4, 'direct', 6,
 'Trains secondary school teachers with specialist subject knowledge and classroom practice.',
 'Secondary school teacher, school principal, subject head of department, education inspector'),
('N015', 'NUL_FED', 'Bachelor of Education in Science', 'degree', 4, 'direct', 6,
 'Specialises in science education for secondary schools, covering Biology, Chemistry and Physics teaching.',
 'Science teacher, laboratory technician, science curriculum developer'),
('N016', 'NUL_FED', 'Bachelor of Special Education', 'degree', 4, 'direct', 6,
 'Focuses on inclusive education and teaching learners with special needs including hearing and visual impairment.',
 'Special education teacher, inclusive education coordinator, disability support specialist'),
('N017', 'NUL_FED', 'Certificate of Secondary Education', 'certificate', 1, 'direct', 5,
 'Professional upgrading certificate for practicing teachers covering curriculum development and pedagogy.',
 'Secondary school teacher (upgrade qualification), education administrator');

-- Faculty of Science & Technology
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, is_gateway_prog, gateway_for, description, career_prospects) VALUES
('N018', 'NUL_FST', 'Bachelor of Science (General)', 'degree', 4, 'direct', 6, TRUE,
 'N019,N020,N021,N022,N023,N024',
 'Gateway programme allowing students to choose science specialisation after first year. Entry point for all BSc specialisations at NUL.',
 'Transfers to specialist BSc programmes after year 1 based on performance and choice');

INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('N019', 'NUL_FST', 'Bachelor of Science in Computer Science', 'degree', 4, 'indirect', 6,
 'Comprehensive computer science covering programming, algorithms, AI, software engineering and networks.',
 'Software developer, systems analyst, IT manager, data scientist, cybersecurity specialist'),
('N020', 'NUL_FST', 'Bachelor of Science in Mathematics & Statistics', 'degree', 4, 'indirect', 6,
 'Rigorous programme in pure and applied mathematics, statistical analysis, and data science.',
 'Data analyst, actuary, statistician, financial analyst, mathematics lecturer'),
('N021', 'NUL_FST', 'Bachelor of Science in Physics', 'degree', 4, 'indirect', 6,
 'Studies mechanics, electromagnetism, thermodynamics, quantum physics and modern physics.',
 'Physics researcher, engineer, meteorologist, radiologist, university lecturer'),
('N022', 'NUL_FST', 'Bachelor of Science in Chemistry', 'degree', 4, 'indirect', 6,
 'Covers organic, inorganic and physical chemistry with laboratory research components.',
 'Chemist, quality control analyst, environmental scientist, chemical engineer'),
('N023', 'NUL_FST', 'Bachelor of Science in Biology', 'degree', 4, 'indirect', 6,
 'Studies cell biology, genetics, ecology, microbiology and evolutionary biology.',
 'Biologist, ecologist, laboratory researcher, public health officer, biotechnologist'),
('N024', 'NUL_FST', 'Bachelor of Science in Environmental Science', 'degree', 4, 'indirect', 6,
 'Interdisciplinary study of environmental systems, climate change, pollution and sustainability.',
 'Environmental consultant, conservation officer, climate researcher, sustainability manager'),
('N025', 'NUL_FST', 'Bachelor of Science in Information Systems', 'degree', 3, 'direct', 6,
 'Combines IT with business management, systems analysis, databases and project management.',
 'Systems analyst, IT project manager, database administrator, business intelligence analyst'),
('N026', 'NUL_FST', 'Bachelor of Science in Human Geography', 'degree', 3, 'direct', 6,
 'Examines human populations and their environment, covering urban studies, GIS and regional development.',
 'Urban planner, GIS specialist, population analyst, environmental researcher'),
('N027', 'NUL_FST', 'Bachelor of Urban & Regional Planning', 'degree', 4, 'direct', 6,
 'Prepares planners to manage urban growth, land use, housing and infrastructure development.',
 'Urban planner, land use consultant, local government planner, spatial development officer'),
('N028', 'NUL_FST', 'Bachelor of Science in Geology', 'degree', 4, 'direct', 6,
 'Studies earth processes, rock formation, mineral resources, hydrogeology and geophysics.',
 'Geologist, mining consultant, hydrogeologist, environmental geologist, surveyor');

-- Faculty of Humanities
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('N029', 'NUL_FHU', 'Bachelor of Arts in Mass Communication', 'degree', 3, 'direct', 6,
 'Covers journalism, broadcasting, digital media, public relations and communication theory.',
 'Journalist, broadcaster, public relations officer, media manager, communications director'),
('N030', 'NUL_FHU', 'Bachelor of Arts in English & Linguistics', 'degree', 3, 'direct', 6,
 'Studies English language, literature, linguistics and communication skills.',
 'English teacher, editor, writer, communications officer, translator, university lecturer'),
('N031', 'NUL_FHU', 'Bachelor of Arts in Sesotho', 'degree', 3, 'direct', 6,
 'Studies Sesotho language, literature, linguistics and cultural heritage.',
 'Sesotho teacher, translator, cultural officer, author, language researcher'),
('N032', 'NUL_FHU', 'Bachelor of Arts in History', 'degree', 3, 'direct', 6,
 'Examines historical periods, research methods, archival studies and heritage management.',
 'Historian, archivist, heritage manager, teacher, researcher, museum curator'),
('N033', 'NUL_FHU', 'Bachelor of Arts in French', 'degree', 3, 'direct', 6,
 'Studies French language, literature, culture and Francophone studies.',
 'French teacher, translator, diplomat, tourism industry, international organisations'),
('N034', 'NUL_FHU', 'Diploma in Mass Communication & Journalism', 'diploma', 3, 'direct', 5,
 'Practical journalism and media training covering news writing, broadcasting and digital media production.',
 'Journalist, reporter, news anchor, radio presenter, social media manager');

-- Faculty of Social Sciences
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('N035', 'NUL_FSS', 'Bachelor of Arts in Economics', 'degree', 3, 'direct', 6,
 'Studies economic theory, micro/macroeconomics, development economics and econometrics.',
 'Economist, banker, financial analyst, government economist, development planner'),
('N036', 'NUL_FSS', 'Bachelor of Commerce in Accounting & Finance', 'degree', 3, 'direct', 6,
 'Financial reporting, auditing, taxation and investment management. Pathway to ACCA/CIMA.',
 'Accountant, auditor, financial manager, tax consultant, investment analyst'),
('N037', 'NUL_FSS', 'Bachelor of Commerce in Marketing', 'degree', 3, 'direct', 6,
 'Marketing strategy, consumer behaviour, digital marketing and brand management.',
 'Marketing manager, brand manager, digital marketer, market researcher'),
('N038', 'NUL_FSS', 'Bachelor of Commerce in Human Resource Management', 'degree', 3, 'direct', 6,
 'Human resource management, labour relations, organisational behaviour and employment law.',
 'HR manager, labour relations officer, training and development specialist'),
('N039', 'NUL_FSS', 'Bachelor of Commerce in Entrepreneurship', 'degree', 3, 'direct', 6,
 'Business creation, innovation, startup management, entrepreneurial finance and SME development.',
 'Entrepreneur, SME owner, business consultant, business development officer'),
('N040', 'NUL_FSS', 'Bachelor of Arts in Sociology', 'degree', 3, 'direct', 6,
 'Social structures, social stratification, gender studies, community development and research methods.',
 'Social researcher, community development officer, policy analyst, lecturer'),
('N041', 'NUL_FSS', 'Bachelor of Social Work', 'degree', 4, 'direct', 6,
 'Trains professional social workers for child protection, community development and social policy work.',
 'Social worker, probation officer, NGO programme officer, community development worker'),
('N042', 'NUL_FSS', 'Bachelor of Arts in Public Administration', 'degree', 3, 'direct', 6,
 'Public sector management, government policy, administrative law and public finance.',
 'Civil servant, government administrator, local authority officer, public policy analyst'),
('N043', 'NUL_FSS', 'Bachelor of Arts in Political Science', 'degree', 3, 'direct', 6,
 'Political theory, government systems, international relations and public policy.',
 'Politician, diplomat, civil servant, researcher, journalist, NGO officer'),
('N044', 'NUL_FSS', 'Bachelor of Arts in International Relations', 'degree', 3, 'direct', 6,
 'Examines global politics, diplomacy, international law, foreign policy and regional integration.',
 'Diplomat, foreign affairs officer, international organisation officer, researcher'),
('N045', 'NUL_FSS', 'Diploma in Mass Communication & Journalism', 'diploma', 3, 'direct', 5,
 'Practical journalism and media training with focus on investigative reporting and digital media.',
 'Journalist, media practitioner, PR officer, social media specialist'),
('N046', 'NUL_FSS', 'Certificate of Proficiency in Insurance', 'certificate', 1, 'direct', 5,
 'Insurance principles, risk management, life and short-term insurance products.',
 'Insurance agent, risk assessor, financial services professional'),
('N047', 'NUL_FSS', 'Diploma in Community Development', 'diploma', 3, 'direct', 5,
 'Community needs assessment, programme planning, project management and community mobilisation.',
 'Community development officer, NGO programme manager, local government official');

-- ============================================================
-- PROGRAMMES — LP (Lerotholi Polytechnic)
-- ============================================================

-- School of Engineering
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('L001', 'LP_SE', 'Bachelor of Engineering in Civil Engineering', 'degree', 5, 'direct', 6,
 'Design, construction and maintenance of infrastructure including roads, bridges, water supply and buildings.',
 'Civil engineer, structural engineer, water engineer, project manager, consulting engineer'),
('L002', 'LP_SE', 'Bachelor of Engineering in Electrical Engineering', 'degree', 5, 'direct', 6,
 'Electrical power systems, electronics, telecommunications and control systems.',
 'Electrical engineer, power systems engineer, telecommunications engineer, electrical contractor'),
('L003', 'LP_SE', 'Bachelor of Engineering in Mechanical Engineering', 'degree', 5, 'direct', 6,
 'Mechanical design, thermodynamics, fluid mechanics, manufacturing and industrial systems.',
 'Mechanical engineer, manufacturing engineer, maintenance engineer, industrial consultant'),
('L004', 'LP_SE', 'Bachelor of Engineering in Irrigation & Drainage', 'degree', 5, 'direct', 6,
 'Specialised engineering for water resources, irrigation systems and drainage design.',
 'Irrigation engineer, water resources engineer, hydrology consultant, agricultural engineer'),
('L005', 'LP_SE', 'Diploma in Civil Engineering', 'diploma', 3, 'direct', 5,
 'Practical civil engineering skills covering surveying, construction materials and site management.',
 'Civil engineering technician, site supervisor, surveying technician, construction manager'),
('L006', 'LP_SE', 'Diploma in Electrical Engineering', 'diploma', 3, 'direct', 5,
 'Practical electrical training in power systems, installations, electronic circuits and control.',
 'Electrical technician, installation supervisor, power utilities technician'),
('L007', 'LP_SE', 'Diploma in Mechanical Engineering', 'diploma', 3, 'direct', 5,
 'Mechanical systems, machine maintenance, workshop technology and industrial processes.',
 'Mechanical technician, plant maintenance technician, workshop supervisor'),
('L008', 'LP_SE', 'Diploma in Electronics & Telecommunications', 'diploma', 3, 'direct', 5,
 'Electronic circuits, telecommunications systems, radio transmission and signal processing.',
 'Electronics technician, telecommunications technician, network support specialist'),
('L009', 'LP_SE', 'Certificate in Electrical Installation', 'certificate', 2, 'direct', 5,
 'Practical electrical training covering wiring, installation, maintenance and electrical safety.',
 'Electrician, electrical installer, maintenance electrician, electrical technician'),
('L010', 'LP_SE', 'Certificate in Building & Construction', 'certificate', 2, 'direct', 5,
 'Bricklaying, plastering, carpentry and general construction skills.',
 'Building artisan, construction worker, site supervisor, building contractor'),
('L011', 'LP_SE', 'Certificate in Plumbing & Pipe Fitting', 'certificate', 2, 'direct', 5,
 'Plumbing systems, pipe fitting, water supply and drainage installation.',
 'Plumber, pipe fitter, water installation technician'),
('L012', 'LP_SE', 'Certificate in Welding & Fabrication', 'certificate', 2, 'direct', 5,
 'Metal welding, fabrication, structural steelwork and metalwork.',
 'Welder, fabricator, metalwork technician, steel construction worker'),
('L013', 'LP_SE', 'Certificate in Carpentry & Joinery', 'certificate', 2, 'direct', 5,
 'Woodwork, furniture making, joinery and timber construction.',
 'Carpenter, joiner, furniture maker, timber construction worker'),
('L014', 'LP_SE', 'Certificate in STEM Foundation', 'certificate', 1, 'direct', 5,
 'Bridging programme in Science, Technology, Engineering and Mathematics for engineering entry.',
 'Pathway to engineering diploma or degree programmes at LP');

-- School of Architecture & Built Environment
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, has_portfolio, has_interview, description, career_prospects) VALUES
('L015', 'LP_SABE', 'Bachelor of Architecture', 'degree', 5, 'direct', 6, TRUE, TRUE,
 'Professional architecture degree covering design, structural engineering, urban design and architectural history.',
 'Architect, urban designer, heritage conservation officer, construction project manager'),
('L016', 'LP_SABE', 'Diploma in Architectural Technology', 'diploma', 3, 'direct', 5, FALSE, FALSE,
 'Technical training in building design, construction drawings, building technology and project management.',
 'Architectural technologist, draughtsperson, building technician, CAD specialist'),
('L017', 'LP_SABE', 'Diploma in Quantity Surveying', 'diploma', 3, 'direct', 5, FALSE, FALSE,
 'Construction economics, cost estimation, contract administration and project cost management.',
 'Quantity surveyor, cost estimator, construction cost manager, project financial controller'),
('L018', 'LP_SABE', 'Diploma in Land Surveying', 'diploma', 3, 'direct', 5, FALSE, FALSE,
 'Land measurement, mapping, GIS technology, boundary determination and cadastral surveying.',
 'Land surveyor, GIS technician, cartographer, cadastral surveyor');

-- School of Business & Management
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('L019', 'LP_SBM', 'Diploma in Business Management', 'diploma', 3, 'direct', 5,
 'Business principles, management functions, marketing, finance and entrepreneurship.',
 'Business administrator, office manager, small business owner, supervisor'),
('L020', 'LP_SBM', 'Diploma in Accounting', 'diploma', 3, 'direct', 5,
 'Financial accounting, bookkeeping, business mathematics and accounting software.',
 'Bookkeeper, accounts clerk, payroll officer, junior accountant'),
('L021', 'LP_SBM', 'Certificate in Secretarial & Office Administration', 'certificate', 2, 'direct', 5,
 'Office management, business communication, record keeping and computer applications.',
 'Secretary, office administrator, receptionist, personal assistant');

-- School of Computing
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('L022', 'LP_SC', 'Diploma in Computer Studies', 'diploma', 3, 'direct', 5,
 'Programming, database management, networking, web development and systems administration.',
 'Software developer, IT support specialist, web developer, database administrator'),
('L023', 'LP_SC', 'Certificate in Business Computing', 'certificate', 2, 'direct', 5,
 'Computer applications for business, spreadsheets, databases, business software and digital skills.',
 'Computer operator, data entry clerk, office computing specialist, administrative assistant');

-- ============================================================
-- PROGRAMMES — BU (Botho University)
-- ============================================================

-- School of Computing & Technology
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('B001', 'BU_SCT', 'BSc (Honours) Computing', 'degree', 4, 'direct', 5,
 'Software engineering, computer networks, database systems, artificial intelligence and cybersecurity.',
 'Software engineer, cybersecurity analyst, network engineer, IT consultant, systems architect'),
('B002', 'BU_SCT', 'BSc (Honours) Information Technology', 'degree', 4, 'direct', 5,
 'IT infrastructure, project management, business analysis, cloud computing and digital transformation.',
 'IT manager, project manager, business analyst, cloud architect, digital transformation consultant'),
('B003', 'BU_SCT', 'Diploma in Information Technology', 'diploma', 2, 'direct', 5,
 'Practical IT skills covering hardware, software, networking, web design and basic programming.',
 'IT technician, helpdesk specialist, network support, web designer');

-- School of Business
INSERT INTO programmes (programme_id, faculty_id, programme_name, qualification_type, duration_years, entry_type, min_subjects_req, description, career_prospects) VALUES
('B004', 'BU_SB', 'Bachelor of Business Administration — General Management', 'degree', 3, 'direct', 5,
 'Comprehensive business education covering management, strategy, operations, and leadership.',
 'Business manager, operations manager, entrepreneur, management consultant'),
('B005', 'BU_SB', 'Bachelor of Business Administration — Accounting & Finance', 'degree', 3, 'direct', 5,
 'Financial accounting, management accounting, corporate finance and investment management. ACCA pathway.',
 'Accountant, financial analyst, auditor, finance manager, ACCA professional'),
('B006', 'BU_SB', 'Bachelor of Business Administration — Human Resource Management', 'degree', 3, 'direct', 5,
 'HR strategy, talent management, labour law, organisational development and employee relations.',
 'HR manager, HR business partner, recruitment specialist, training and development manager'),
('B007', 'BU_SB', 'Bachelor of Business Administration — Marketing', 'degree', 3, 'direct', 5,
 'Marketing strategy, digital marketing, brand management, consumer behaviour and market research.',
 'Marketing manager, brand manager, digital marketer, advertising executive'),
('B008', 'BU_SB', 'BSc (Honours) Health Information Management', 'degree', 4, 'direct', 5,
 'Healthcare data management, medical coding, health informatics, electronic health records and data quality.',
 'Health information manager, medical records officer, clinical data analyst, health informatics specialist'),
('B009', 'BU_SB', 'Diploma in Business Management', 'diploma', 2, 'direct', 5,
 'Core business skills in management, finance, marketing and entrepreneurship.',
 'Junior business administrator, supervisor, small business owner, office manager');

-- ============================================================
-- SUBJECT REQUIREMENTS
-- ============================================================

-- ── NUL: English is compulsory (C or better) for ALL degree/diploma programmes ──
-- We insert English C requirement for each programme individually below.

-- N001 BSc Agriculture
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N001', 'ENG',  'C', TRUE),
('N001', 'BIO',  'C', TRUE),
('N001', 'CHEM', 'C', TRUE),
('N001', 'MATH', 'C', TRUE);

-- N002 BSc Agricultural Economics
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N002', 'ENG',  'C', TRUE),
('N002', 'MATH', 'C', TRUE);
INSERT INTO subject_requirements (programme_id, subject_id, subject_group, min_grade, is_compulsory, condition_note) VALUES
('N002', NULL, '["ECON","BSTUD","COMM","ACCNT"]', 'C', FALSE, 'One of Economics, Business Studies, Commerce or Accounting at C recommended');

-- N003 BSc Consumer Science
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N003', 'ENG',  'C', TRUE),
('N003', 'BIO',  'C', TRUE),
('N003', 'CHEM', 'C', TRUE);

-- N004 BSc Range Resources & Ecology
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N004', 'ENG',  'C', TRUE),
('N004', 'BIO',  'C', TRUE);
INSERT INTO subject_requirements (programme_id, subject_id, subject_group, min_grade, is_compulsory, condition_note) VALUES
('N004', NULL, '["CHEM","AGRI","GEOG"]', 'C', FALSE, 'Chemistry, Agriculture or Geography at C recommended');

-- N005 BSc Food Science & Nutrition
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N005', 'ENG',  'C', TRUE),
('N005', 'BIO',  'C', TRUE),
('N005', 'CHEM', 'C', TRUE);

-- N006 Diploma in Agriculture
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N006', 'ENG', 'D', TRUE);
INSERT INTO subject_requirements (programme_id, subject_id, subject_group, min_grade, is_compulsory, condition_note) VALUES
('N006', NULL, '["BIO","AGRI"]', 'D', TRUE, 'Biology or Agriculture at D or better required');

-- N007 BNursing
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N007', 'ENG',  'C', TRUE),
('N007', 'BIO',  'C', TRUE),
('N007', 'CHEM', 'C', TRUE),
('N007', 'MATH', 'C', TRUE);

-- N008 BPharmacy
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N008', 'ENG',  'C', TRUE),
('N008', 'BIO',  'B', TRUE),
('N008', 'CHEM', 'B', TRUE),
('N008', 'MATH', 'B', TRUE);

-- N009 BSc Environmental Health
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N009', 'ENG',  'C', TRUE),
('N009', 'BIO',  'C', TRUE),
('N009', 'CHEM', 'C', TRUE);

-- N010 BSc Medical Laboratory Sciences
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N010', 'ENG',  'C', TRUE),
('N010', 'BIO',  'C', TRUE),
('N010', 'CHEM', 'C', TRUE),
('N010', 'MATH', 'C', TRUE);

-- N011 Diploma Pharmaceutical Technology
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N011', 'ENG',  'C', TRUE),
('N011', 'BIO',  'C', TRUE),
('N011', 'CHEM', 'C', TRUE);

-- N012 LLB
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N012', 'ENG', 'B', TRUE);

-- N013 BEd Primary
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N013', 'ENG',  'C', TRUE),
('N013', 'MATH', 'C', TRUE);

-- N014 BEd Secondary
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N014', 'ENG', 'B', TRUE);

-- N015 BEd Science
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N015', 'ENG',  'C', TRUE),
('N015', 'MATH', 'C', TRUE);
INSERT INTO subject_requirements (programme_id, subject_id, subject_group, min_grade, is_compulsory, condition_note) VALUES
('N015', NULL, '["BIO","CHEM","PHYS","PHYSCI"]', 'C', TRUE, 'At least one science subject at C required');

-- N016 BSpecial Education
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N016', 'ENG', 'C', TRUE);

-- N017 Certificate Secondary Education
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N017', 'ENG', 'D', TRUE);

-- N018 BSc General (Gateway)
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N018', 'ENG',  'C', TRUE),
('N018', 'MATH', 'C', TRUE);
INSERT INTO subject_requirements (programme_id, subject_id, subject_group, min_grade, is_compulsory, condition_note) VALUES
('N018', NULL, '["BIO","CHEM","PHYS","PHYSCI"]', 'C', TRUE, 'At least one of Biology, Chemistry, Physics or Physical Science at C required');

-- N019-N024 indirect (via N018 gateway) — no separate subject requirements needed
-- They will be flagged as INDIRECT_ENTRY by the engine

-- N025 BSc Information Systems
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N025', 'ENG',  'C', TRUE),
('N025', 'MATH', 'C', TRUE);

-- N026 BSc Human Geography
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N026', 'ENG',  'C', TRUE),
('N026', 'GEOG', 'C', TRUE);

-- N027 Bachelor Urban & Regional Planning
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N027', 'ENG',  'C', TRUE),
('N027', 'GEOG', 'C', TRUE),
('N027', 'MATH', 'C', TRUE);

-- N028 BSc Geology
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N028', 'ENG',  'C', TRUE),
('N028', 'MATH', 'C', TRUE);
INSERT INTO subject_requirements (programme_id, subject_id, subject_group, min_grade, is_compulsory, condition_note) VALUES
('N028', NULL, '["CHEM","PHYS","PHYSCI"]', 'C', TRUE, 'Chemistry or Physics at C required');

-- N029 BA Mass Communication
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N029', 'ENG', 'B', TRUE);

-- N030 BA English & Linguistics
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N030', 'ENG', 'B', TRUE);

-- N031 BA Sesotho
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N031', 'ENG',  'C', TRUE),
('N031', 'SESO', 'C', TRUE);

-- N032 BA History
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N032', 'ENG',  'C', TRUE),
('N032', 'HIST', 'C', TRUE);

-- N033 BA French
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N033', 'ENG',  'C', TRUE),
('N033', 'FREN', 'C', TRUE);

-- N034 Diploma Mass Communication
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N034', 'ENG', 'C', TRUE);

-- N035 BA Economics
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N035', 'ENG',  'C', TRUE),
('N035', 'MATH', 'C', TRUE);

-- N036 BCom Accounting & Finance
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N036', 'ENG',   'C', TRUE),
('N036', 'MATH',  'C', TRUE),
('N036', 'ACCNT', 'C', TRUE);

-- N037 BCom Marketing
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N037', 'ENG',  'C', TRUE),
('N037', 'MATH', 'C', TRUE);

-- N038 BCom HRM
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N038', 'ENG', 'C', TRUE);

-- N039 BCom Entrepreneurship
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N039', 'ENG',  'C', TRUE),
('N039', 'MATH', 'C', TRUE);

-- N040 BA Sociology
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N040', 'ENG', 'C', TRUE);

-- N041 BSocial Work
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N041', 'ENG', 'C', TRUE);

-- N042 BA Public Administration
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N042', 'ENG', 'C', TRUE);

-- N043 BA Political Science
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N043', 'ENG', 'C', TRUE);

-- N044 BA International Relations
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N044', 'ENG', 'C', TRUE);

-- N045 Diploma Mass Comm (FSS)
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N045', 'ENG', 'C', TRUE);

-- N046 Certificate Insurance
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N046', 'MATH', 'D', TRUE);

-- N047 Diploma Community Development
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('N047', 'ENG', 'C', TRUE);

-- ── LP Subject Requirements ──

-- L001 BEng Civil Engineering
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L001', 'MATH', 'B', TRUE),
('L001', 'PHYS', 'B', TRUE),
('L001', 'ENG',  'C', TRUE);

-- L002 BEng Electrical Engineering
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L002', 'MATH', 'B', TRUE),
('L002', 'PHYS', 'B', TRUE),
('L002', 'ENG',  'C', TRUE);

-- L003 BEng Mechanical Engineering
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L003', 'MATH', 'B', TRUE),
('L003', 'PHYS', 'B', TRUE),
('L003', 'ENG',  'C', TRUE);

-- L004 BEng Irrigation & Drainage
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L004', 'MATH', 'C', TRUE),
('L004', 'PHYS', 'C', TRUE),
('L004', 'ENG',  'C', TRUE);

-- L005 Diploma Civil Engineering
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L005', 'MATH', 'C', TRUE),
('L005', 'PHYS', 'C', TRUE),
('L005', 'ENG',  'D', TRUE);

-- L006 Diploma Electrical Engineering
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L006', 'MATH', 'C', TRUE),
('L006', 'PHYS', 'C', TRUE);

-- L007 Diploma Mechanical Engineering
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L007', 'MATH', 'C', TRUE),
('L007', 'PHYS', 'C', TRUE);

-- L008 Diploma Electronics & Telecoms
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L008', 'MATH', 'C', TRUE),
('L008', 'PHYS', 'C', TRUE);

-- L009 Cert Electrical Installation
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L009', 'MATH', 'D', TRUE);
INSERT INTO subject_requirements (programme_id, subject_id, subject_group, min_grade, is_compulsory, condition_note) VALUES
('L009', NULL, '["PHYS","PHYSCI"]', 'D', FALSE, 'Physics or Physical Science recommended');

-- L010 Cert Building & Construction
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L010', 'MATH', 'D', TRUE);

-- L011 Cert Plumbing
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L011', 'MATH', 'D', TRUE);

-- L012 Cert Welding
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L012', 'MATH', 'D', TRUE);

-- L013 Cert Carpentry
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L013', 'MATH', 'D', TRUE);

-- L014 Cert STEM Foundation
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L014', 'MATH', 'E', TRUE);

-- L015 Bachelor Architecture (portfolio + interview)
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L015', 'MATH', 'C', TRUE),
('L015', 'ENG',  'C', TRUE);
INSERT INTO subject_requirements (programme_id, subject_id, subject_group, min_grade, is_compulsory, condition_note) VALUES
('L015', NULL, '["ARTD","TDRAW","TDARTS"]', 'C', TRUE, 'Art & Design OR Technical Drawing OR Technical Arts at C required');

-- L016 Diploma Architectural Technology
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L016', 'MATH', 'C', TRUE),
('L016', 'ENG',  'D', TRUE);

-- L017 Diploma Quantity Surveying
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L017', 'MATH', 'C', TRUE),
('L017', 'ENG',  'D', TRUE);

-- L018 Diploma Land Surveying
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L018', 'MATH', 'C', TRUE),
('L018', 'ENG',  'D', TRUE);

-- L019 Diploma Business Management
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L019', 'ENG', 'C', TRUE);
INSERT INTO subject_requirements (programme_id, subject_id, subject_group, min_grade, is_compulsory, condition_note) VALUES
('L019', NULL, '["MATH","ACCNT","BSTUD","ECON","COMM"]', 'C', FALSE, 'Numeracy subject at C recommended');

-- L020 Diploma Accounting
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L020', 'ENG',   'C', TRUE),
('L020', 'MATH',  'C', TRUE),
('L020', 'ACCNT', 'C', FALSE);

-- L021 Cert Secretarial
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L021', 'ENG', 'D', TRUE);

-- L022 Diploma Computer Studies
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L022', 'MATH', 'C', TRUE),
('L022', 'ENG',  'C', TRUE);

-- L023 Cert Business Computing
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory) VALUES
('L023', 'ENG',  'D', TRUE),
('L023', 'MATH', 'D', TRUE);

-- ── BU Subject Requirements ──
-- BU uses botho_points system: credits (≥C, ≥8pts) and passes (≥D, ≥5pts)
-- English must be a CREDIT (≥C) for all BU degree programmes

-- B001 BSc Computing
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory, condition_note) VALUES
('B001', 'ENG',  'C', TRUE, 'English Language credit required'),
('B001', 'MATH', 'C', TRUE, 'Mathematics credit required');

-- B002 BSc IT
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory, condition_note) VALUES
('B002', 'ENG',  'C', TRUE, 'English Language credit required'),
('B002', 'MATH', 'C', TRUE, 'Mathematics credit required');

-- B003 Diploma IT
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory, condition_note) VALUES
('B003', 'ENG',  'D', TRUE, 'English Language pass required'),
('B003', 'MATH', 'D', TRUE, 'Mathematics pass required');

-- B004 BBA General Management
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory, condition_note) VALUES
('B004', 'ENG',  'C', TRUE, 'English Language credit required');

-- B005 BBA Accounting & Finance
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory, condition_note) VALUES
('B005', 'ENG',   'C', TRUE, 'English Language credit required'),
('B005', 'MATH',  'C', TRUE, 'Mathematics credit required'),
('B005', 'ACCNT', 'C', FALSE, 'Accounting credit strongly recommended');

-- B006 BBA HRM
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory, condition_note) VALUES
('B006', 'ENG', 'C', TRUE, 'English Language credit required');

-- B007 BBA Marketing
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory, condition_note) VALUES
('B007', 'ENG',  'C', TRUE, 'English Language credit required'),
('B007', 'MATH', 'D', FALSE, 'Mathematics pass recommended');

-- B008 BSc Health Information Management
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory, condition_note) VALUES
('B008', 'ENG',  'C', TRUE, 'English Language credit required'),
('B008', 'MATH', 'D', TRUE, 'Mathematics pass required'),
('B008', 'BIO',  'D', FALSE, 'Biology pass recommended');

-- B009 Diploma Business Management
INSERT INTO subject_requirements (programme_id, subject_id, min_grade, is_compulsory, condition_note) VALUES
('B009', 'ENG',  'D', TRUE, 'English Language pass required');

-- ============================================================
-- PROGRAMME GRADE RULES (count-based, NUL degrees)
-- ============================================================

-- Degree programmes typically require at least 4 subjects at C or better (best 6 calc)
INSERT INTO programme_grade_rules (programme_id, min_grade, min_count, notes) VALUES
('N001', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N002', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N003', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N004', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N005', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N007', 'C', 5, 'At least 5 subjects at grade C or better — health sciences'),
('N008', 'B', 3, 'At least 3 subjects at grade B or better — pharmacy competitive entry'),
('N009', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N010', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N012', 'C', 5, 'At least 5 subjects at grade C or better — law entry requirement'),
('N013', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N014', 'C', 5, 'At least 5 subjects at grade C or better required'),
('N015', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N018', 'C', 4, 'At least 4 subjects at grade C or better for BSc gateway'),
('N019', 'C', 4, 'At least 4 subjects at grade C or better'),
('N020', 'C', 4, 'At least 4 subjects at grade C or better'),
('N025', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N035', 'C', 4, 'At least 4 subjects at grade C or better required'),
('N036', 'C', 4, 'At least 4 subjects at grade C or better required');

-- LP degree-level grade rules (broad base requirement)
INSERT INTO programme_grade_rules (programme_id, min_grade, min_count, notes) VALUES
('L001', 'B', 3, 'Minimum 3 subjects at B or better for degree engineering'),
('L002', 'B', 3, 'Minimum 3 subjects at B or better for degree engineering'),
('L003', 'B', 3, 'Minimum 3 subjects at B or better for degree engineering');

-- BU credit/pass rules
INSERT INTO programme_grade_rules (programme_id, min_grade, min_count, notes) VALUES
('B001', 'C', 3, 'Minimum 3 credits (C or better) required — computing degree'),
('B002', 'C', 3, 'Minimum 3 credits (C or better) required — IT degree'),
('B004', 'C', 3, 'Minimum 3 credits (C or better) required — BBA'),
('B005', 'C', 3, 'Minimum 3 credits (C or better) required — BBA Accounting'),
('B006', 'C', 3, 'Minimum 3 credits (C or better) required — BBA HRM'),
('B007', 'C', 3, 'Minimum 3 credits (C or better) required — BBA Marketing'),
('B008', 'C', 3, 'Minimum 3 credits (C or better) required — Health Info Mgmt'),
-- Pass rules for BU degrees
('B001', 'D', 2, 'Plus 2 additional passes (D or better) required'),
('B002', 'D', 2, 'Plus 2 additional passes (D or better) required'),
('B004', 'D', 2, 'Plus 2 additional passes (D or better) required'),
('B005', 'D', 2, 'Plus 2 additional passes (D or better) required'),
('B006', 'D', 2, 'Plus 2 additional passes (D or better) required'),
('B007', 'D', 2, 'Plus 2 additional passes (D or better) required'),
('B008', 'D', 2, 'Plus 2 additional passes (D or better) required');

-- ============================================================
-- APS THRESHOLDS
-- ============================================================
-- NUL: aps_max = maximum APS sum allowed (lower APS = better in NUL system)
-- LP: no APS (NULL) — pure grade checks
-- BU: min_credits_count + min_pass_count (Botho points system, no APS)

-- NUL Thresholds
INSERT INTO aps_thresholds (programme_id, aps_max, aps_min, notes) VALUES
-- Agriculture Faculty (degrees aps_max=26, diplomas=32)
('N001', 26, NULL, 'BSc Agriculture: NUL aggregate ≤26 in best 6 subjects'),
('N002', 26, NULL, 'BSc Agric Economics: aggregate ≤26'),
('N003', 26, NULL, 'BSc Consumer Science: aggregate ≤26'),
('N004', 26, NULL, 'BSc Range Resources: aggregate ≤26'),
('N005', 26, NULL, 'BSc Food Science: aggregate ≤26'),
('N006', 32, NULL, 'Diploma Agriculture: aggregate ≤32'),
-- Health Sciences (competitive)
('N007', 24, NULL, 'BNursing: NUL aggregate ≤24 (competitive)'),
('N008', 20, NULL, 'BPharmacy: NUL aggregate ≤20 (most competitive)'),
('N009', 26, NULL, 'BSc Environmental Health: aggregate ≤26'),
('N010', 24, NULL, 'BSc Medical Lab Sciences: aggregate ≤24 (competitive)'),
('N011', 32, NULL, 'Diploma Pharmaceutical Tech: aggregate ≤32'),
-- Law
('N012', 22, NULL, 'LLB: NUL aggregate ≤22 (highly competitive)'),
-- Education
('N013', 30, NULL, 'BEd Primary: aggregate ≤30'),
('N014', 26, NULL, 'BEd Secondary: aggregate ≤26'),
('N015', 26, NULL, 'BEd Science: aggregate ≤26'),
('N016', 32, NULL, 'BSpecial Education: aggregate ≤32'),
('N017', 36, NULL, 'Cert Secondary Education: aggregate ≤36 (lenient entry)'),
-- Science & Technology
('N018', 26, NULL, 'BSc General (Gateway): aggregate ≤26'),
('N019', NULL, NULL, 'BSc CS: indirect entry via N018 — no direct APS threshold'),
('N020', NULL, NULL, 'BSc Maths: indirect entry via N018 — no direct APS threshold'),
('N021', NULL, NULL, 'BSc Physics: indirect — no direct threshold'),
('N022', NULL, NULL, 'BSc Chemistry: indirect — no direct threshold'),
('N023', NULL, NULL, 'BSc Biology: indirect — no direct threshold'),
('N024', NULL, NULL, 'BSc Env Science: indirect — no direct threshold'),
('N025', 28, NULL, 'BSc Information Systems: aggregate ≤28'),
('N026', 30, NULL, 'BSc Human Geography: aggregate ≤30'),
('N027', 28, NULL, 'BUrban & Regional Planning: aggregate ≤28'),
('N028', 26, NULL, 'BSc Geology: aggregate ≤26'),
-- Humanities
('N029', 28, NULL, 'BA Mass Communication: aggregate ≤28'),
('N030', 26, NULL, 'BA English & Linguistics: aggregate ≤26'),
('N031', 30, NULL, 'BA Sesotho: aggregate ≤30'),
('N032', 30, NULL, 'BA History: aggregate ≤30'),
('N033', 30, NULL, 'BA French: aggregate ≤30'),
('N034', 34, NULL, 'Diploma Mass Communication: aggregate ≤34'),
-- Social Sciences
('N035', 26, NULL, 'BA Economics: aggregate ≤26'),
('N036', 26, NULL, 'BCom Accounting & Finance: aggregate ≤26'),
('N037', 28, NULL, 'BCom Marketing: aggregate ≤28'),
('N038', 30, NULL, 'BCom HRM: aggregate ≤30'),
('N039', 30, NULL, 'BCom Entrepreneurship: aggregate ≤30'),
('N040', 30, NULL, 'BA Sociology: aggregate ≤30'),
('N041', 30, NULL, 'BSocial Work: aggregate ≤30'),
('N042', 30, NULL, 'BA Public Administration: aggregate ≤30'),
('N043', 30, NULL, 'BA Political Science: aggregate ≤30'),
('N044', 28, NULL, 'BA International Relations: aggregate ≤28'),
('N045', 34, NULL, 'Diploma Mass Communication (FSS): aggregate ≤34'),
('N046', 36, NULL, 'Cert Proficiency Insurance: aggregate ≤36'),
('N047', 34, NULL, 'Diploma Community Development: aggregate ≤34');

-- LP: no APS thresholds (NULL)
INSERT INTO aps_thresholds (programme_id, aps_max, aps_min, min_credits_count, min_pass_count, notes) VALUES
('L001', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L002', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L003', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L004', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L005', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L006', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L007', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L008', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L009', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L010', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L011', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L012', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L013', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L014', NULL, NULL, NULL, NULL, 'LP: STEM foundation — no APS'),
('L015', NULL, NULL, NULL, NULL, 'LP: Architecture — grade-check + portfolio + interview'),
('L016', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L017', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L018', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L019', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L020', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L021', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L022', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only'),
('L023', NULL, NULL, NULL, NULL, 'LP: no APS — grade-check only');

-- BU: credits and passes count (Botho points system)
INSERT INTO aps_thresholds (programme_id, aps_max, aps_min, min_credits_count, min_pass_count, notes) VALUES
('B001', NULL, NULL, 3, 2, 'BU: 3 credits + 2 passes (5 subjects total) — Computing'),
('B002', NULL, NULL, 3, 2, 'BU: 3 credits + 2 passes (5 subjects total) — IT'),
('B003', NULL, NULL, 1, 4, 'BU: 1 credit + 4 passes — Diploma IT'),
('B004', NULL, NULL, 3, 2, 'BU: 3 credits + 2 passes — BBA General'),
('B005', NULL, NULL, 3, 2, 'BU: 3 credits + 2 passes — BBA Accounting'),
('B006', NULL, NULL, 3, 2, 'BU: 3 credits + 2 passes — BBA HRM'),
('B007', NULL, NULL, 3, 2, 'BU: 3 credits + 2 passes — BBA Marketing'),
('B008', NULL, NULL, 3, 2, 'BU: 3 credits + 2 passes — Health Info Mgmt'),
('B009', NULL, NULL, 1, 4, 'BU: 1 credit + 4 passes — Diploma Business');

-- ============================================================
-- END OF SEED DATA
-- ============================================================
SELECT 'Seed data loaded successfully.' AS status;
SELECT COUNT(*) AS institutions FROM institutions;
SELECT COUNT(*) AS faculties FROM faculties;
SELECT COUNT(*) AS subjects FROM subjects;
SELECT COUNT(*) AS programmes FROM programmes;
SELECT COUNT(*) AS subject_requirements FROM subject_requirements;
SELECT COUNT(*) AS aps_thresholds FROM aps_thresholds;
