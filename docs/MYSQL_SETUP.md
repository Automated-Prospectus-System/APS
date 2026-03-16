# 🗄️ APS System - MySQL Hybrid Setup Guide (REQUIRED)

## 📋 Overview

**Hybrid Architecture:**
- ✅ Production: Uses **MySQL** for data persistence and scalability
- ✅ Development: **Auto-initializes** with one command
- ✅ Seed Data: Pre-loaded with 6 universities and 20 programs
- ✅ No Manual Steps: Automatic schema and data loading

> ⚠️ **MySQL is REQUIRED** - The system will fail without it after recent updates.

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install MySQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install mysql-server mysql-client
sudo service mysql start
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
- Download: https://dev.mysql.com/downloads/mysql/
- Run installer

**Verify:**
```bash
mysql --version
mysql -u root -e "SELECT VERSION();"
```

### Step 2: Create .env Configuration File

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=aps_user
DB_PASSWORD=aps_secure_password_123
DB_NAME=aps_system
DB_ROOT_USER=root
DB_ROOT_PASSWORD=
```

> 💡 `DB_ROOT_PASSWORD` is usually empty on Linux. Adjust if you set your own.

### Step 3: Run Auto-Initialization

```bash
python3 database/init_mysql.py
```

**Expected output:**
```
🚀 APS System - Database Initialization
   Database: aps_system @ localhost:3306

🔧 Creating MySQL database and user...
✓ Database 'aps_system' created/exists
✓ User 'aps_user' created/exists with privileges granted
📋 Creating database schema...
✓ Database schema created/verified
📥 Loading seed data into MySQL...
✓ Loaded 6 universities
✓ Loaded 20 programs
✅ Database initialization complete!
   You can now start the application with: python3 app_mysql.py
```

### Step 4: Start Application

```bash
python3 app_mysql.py
```

Access at: **http://localhost:5000**

---

## ✅ What Gets Auto-Configured

### Database Structure
```
aps_system/
├── universities (6 records: NUL, Lerotholi, LCE, Botho, Limkokwing, AUCC)
├── programs (20 records: Engineering, Business, Education, Medicine, Law, IT)
├── faculties
├── subject_requirements
├── eligibility_checks
└── data_sources
```

### Pre-Loaded Data
- **Universities**: 6 Lesotho institutions with contact info
- **Programs**: 20 programs across all universities
- **Schema**: 8 tables with proper indexing and foreign keys

---

## 📥 Data Extraction & Population

### Method 1: Extract from PDF Prospectuses

#### 1a. Place PDF Files

Create `/data_extraction/prospectuses/` and add prospectus PDFs:

```bash
mkdir -p data_extraction/prospectuses
# Place PDF files in this directory
```

Files to place (download from university websites):
- `Printable-Prospectus-2025-2026.pdf` (NUL)
- `2026-LP-PROSPECTUS.pdf` (Lerotholi Polytechnic)
- And other prospectuses

#### 1b. Run PDF Extraction

```bash
python3 data_extraction/pdf_extractor.py
```

Output:
- `extracted_data.json` - Extracted program data

Check results:
```bash
cat extracted_data.json | python3 -m json.tool | head -50
```

### Method 2: Web Scraping Universities

Run the web scraper:

```bash
python3 data_extraction/web_scraper.py
```

Output:
- `scraped_data.json` - Programs scraped from websites

Check results:
```bash
cat scraped_data.json | python3 -m json.tool | head -50
```

### Method 3: Load All Data into Database

After extraction/scraping, populate the database:

```bash
python3 database/data_loader.py
```

Expected output:
```
============================================================
APS DATABASE POPULATION
============================================================

Processing: National University of Lesotho
  ✓ Added: Bachelor of Science in Engineering
  ✓ Added: Bachelor of Arts in Education
  ... (more programs)

Data population complete
  Programs added: 45
  Errors: 2
```

**Verify Data Was Loaded:**

```bash
mysql -u aps_user -p aps_system <<EOF
SELECT COUNT(*) as total_programs FROM programs;
SELECT u.name, COUNT(p.id) as program_count 
FROM universities u 
LEFT JOIN programs p ON u.id = p.university_id 
GROUP BY u.id, u.name;
EOF
```

---

## 🚀 Running the Application

### Start Backend with MySQL

Switch from in-memory version to MySQL version:

```bash
# Stop old version (if running)
pkill -f "python3 app.py"

# Start MySQL version
python3 app_mysql.py
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║   🎓 APS - Automatic Prospectus System v2.0            ║
║   Lesotho Higher Education Guidance Platform            ║
╚═══════════════════════════════════════════════════════════╝

Database Configuration:
  Host: localhost
  Database: aps_system
  Port: 3306

Running on http://127.0.0.1:5000
```

### Test API Endpoints

In another terminal:

```bash
# Health check
curl http://localhost:5000/api/health

# Get universities
curl http://localhost:5000/api/universities

# Get programs
curl http://localhost:5000/api/programs

# Check eligibility
curl -X POST http://localhost:5000/api/eligibility \
  -H "Content-Type: application/json" \
  -d '{
    "subjects": [
      {"subject": "Mathematics", "grade": "A"},
      {"subject": "English", "grade": "B"},
      {"subject": "Science", "grade": "A"},
      {"subject": "Geography", "grade": "C"}
    ]
  }'
```

---

## 📊 Database Schema Overview

### Universities
```
id, name, country, city, icon, website, email, phone, description, prospectus_url
```

### Faculties
```
id, university_id, name, description, website, email
```

### Programs
```
id, university_id, faculty_id, name, field_of_study, qualification_type, 
duration_years, description, entry_requirements, compulsory_subjects (JSON), 
subject_requirements (JSON), minimum_score, admission_email, application_deadline
```

### Subject Requirements
```
id, program_id, subject_name, minimum_grade, is_compulsory
```

### Eligibility Checks (Analytics)
```
id, subjects_submitted (JSON), total_score, eligible_programs_count, 
borderline_programs_count, not_eligible_programs_count, timestamp
```

### Data Sources (Track Origin)
```
id, program_id, university_id, source_type, source_url, source_file, 
extraction_date, last_verified, data_quality_score, notes
```

---

## 🔄 Data Refresh Workflow

To update the database with new prospectus data:

```bash
# 1. Place new PDF files
cp ~/Downloads/prospectus-*.pdf data_extraction/prospectuses/

# 2. Extract data
python3 data_extraction/pdf_extractor.py

# 3. Scrape websites
python3 data_extraction/web_scraper.py

# 4. Backup current data (optional)
mysql -u aps_user -p aps_system -e "INSERT INTO data_sources (source_type, extraction_date, notes) VALUES ('backup', NOW(), 'Backup before refresh');"

# 5. Load new data
python3 database/data_loader.py

# 6. Verify
mysql -u aps_user -p aps_system -e "SELECT COUNT(*) as total FROM programs;"
```

---

## 🛠️ Common Database Tasks

### View Database Statistics

```sql
-- Programs by university
SELECT u.name, COUNT(p.id) as programs
FROM universities u
LEFT JOIN programs p ON u.id = p.university_id
GROUP BY u.id, u.name;

-- Programs by field of study
SELECT field_of_study, COUNT(*) as count
FROM programs
GROUP BY field_of_study;

-- Programs by qualification type
SELECT qualification_type, COUNT(*) as count
FROM programs
GROUP BY qualification_type;

-- Average minimum score by field
SELECT field_of_study, AVG(minimum_score) as avg_score
FROM programs
GROUP BY field_of_study;
```

### Backup Database

```bash
mysqldump -u aps_user -p aps_system > aps_backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u aps_user -p aps_system < aps_backup_20240315.sql
```

### Clean Extracted Data

```bash
# Remove old extraction results
rm data_extraction/extracted_data.json
rm data_extraction/scraped_data.json
```

---

## ✅ Troubleshooting

### Problem: "No module named 'mysql.connector'"

**Solution:**
```bash
pip install mysql-connector-python
```

### Problem: "Access denied for user 'aps_user'"

**Solution:** Verify MySQL user setup
```bash
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User LIKE 'aps%';"
```

### Problem: "Database aps_system doesn't exist"

**Solution:** Create database
```bash
python3 database/db_manager.py
```

### Problem: "No data in database after loading"

**Check:**
1. Verify extraction files exist:
   ```bash
   ls -la data_extraction/extracted_data.json
   ls -la data_extraction/scraped_data.json
   ```

2. Check file format:
   ```bash
   python3 -c "import json; print(json.dumps(json.load(open('data_extraction/extracted_data.json')), indent=2)[:500])"
   ```

3. Run data loader with verbose output:
   ```bash
   python3 database/data_loader.py
   ```

### Problem: PDF Extraction Finds No Programs

**Solution:**
1. Verify PDF is valid:
   ```bash
   python3 -c "from PyPDF2 import PdfReader; print(len(PdfReader('file.pdf').pages))"
   ```

2. Check extracted text:
   ```bash
   python3 -c "from data_extraction.pdf_extractor import ProspectusExtractor; p = ProspectusExtractor('file.pdf'); print(p.text[:1000])"
   ```

---

## 📈 Next Steps

1. **Configure Admin Users** - Add admin accounts to admin_users table
2. **Setup Admin Dashboard** - Create CRUD operations for programs
3. **Enable Authentication** - JWT tokens for API security
4. **Configure Email** - Send eligibility reports via email
5. **Setup Cron Jobs** - Auto-refresh data on schedule
6. **Production Deployment** - Move to Gunicorn + Nginx

---

## 📚 Additional Resources

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **PyPDF2 Documentation**: https://pypdf2.readthedocs.io/
- **Beautiful Soup Documentation**: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- **Flask-SQLAlchemy** (for ORM alternative): https://flask-sqlalchemy.palletsprojects.com/

---

**Version**: 2.0
**Last Updated**: 2024-03-10
**Status**: MySQL Integration Complete
