# Project Structure Guide

## Overview
APS (Automatic Prospectus System) has been reorganized with a clear separation of concerns:

```
/APS
├── Backend/              # Flask API server
├── Frontend/             # Web interface
├── Database/             # Data management
├── docs/                 # Documentation
├── Configuration files   # setup.sh, run.sh, requirements, etc.
└── README.md
```

## Directory Structure

### 📁 Backend/ 
Main Flask application handling API requests and authentication.

```
Backend/
├── __init__.py          # Python package marker
├── app_mysql.py         # Main Flask app (PRIMARY - Use this!)
├── app_old.py           # Legacy version (archived)
├── auth_manager.py      # Authentication utilities
├── requirements.txt     # Python dependencies
└── __pycache__/
```

**Key File**: `app_mysql.py` → Serves API on port 5000

**Usage**:
```bash
cd Backend
pip install -r requirements.txt
python3 app_mysql.py
```

---

### 📁 Frontend/
Web interface with HTML pages and static assets.

```
Frontend/
├── login.html           # Login page (ENTRY POINT)
├── home.html            # Dashboard
├── programs.html        # Programs listing
├── universities.html    # Universities listing
├── assets/
│   ├── js/
│   │   ├── auth.js      # Authentication client
│   │   ├── script.js    # General utilities
│   │   └── script-api.js # API client
│   └── css/
│       └── style.css    # Main stylesheet
└── [unused files archived]
```

**Entry Point**: Open `Frontend/login.html` in browser
- Ensure Backend is running on `http://localhost:5000`
- All API requests go through `script-api.js`

---

### 📁 Database/
Data management, extraction, and database schema.

```
Database/
├── __init__.py          # Python package marker
├── data_seed.json       # Sample/seed data
├── users.json          # User accounts list
├── database/            # Database management modules
│   ├── __init__.py
│   ├── db_manager.py    # Database operations
│   ├── data_loader.py   # Data import/export
│   ├── init_mysql.py    # MySQL initialization
│   ├── schema.sql       # Database schema
│   └── __pycache__/
└── data_extraction/     # Data ingestion tools
    ├── __init__.py
    ├── pdf_extractor.py # PDF data extraction
    ├── web_scraper.py   # Web scraping tool
    ├── prospectuses/    # PDF storage
    └── __pycache__/
```

**Key Operations**:
- Database setup: `python3 Database/database/init_mysql.py`
- Data loading: `python3 Database/data_loader.py`
- PDF extraction: `python3 Database/data_extraction/pdf_extractor.py`

---

### 📁 docs/
Documentation and deployment guides.

- `QUICK_START.md` - Quick setup guide
- `AUTHENTICATION_SETUP.md` - Auth configuration
- `MYSQL_SETUP.md` - Database setup
- `API_REFERENCE.md` - API endpoints
- `TROUBLESHOOTING.md` - Common issues
- (Other deployment and status documents)

---

## Setup Instructions

### 1. Initial Setup
```bash
cd /home/mokane/Desktop/APS
chmod +x setup.sh run.sh verify.sh
./setup.sh
```

### 2. Database Setup (MySQL)
```bash
./setup_mysql.sh
# OR manually:
python3 Database/database/init_mysql.py
```

### 3. Backend Setup
```bash
pip install -r Backend/requirements.txt
python3 Backend/app_mysql.py
```

### 4. Frontend Access
Open in browser: `file:///home/mokane/Desktop/APS/Frontend/login.html`
Or serve with: `python3 -m http.server 8000 --directory Frontend`

---

## File Import Paths

### Backend Imports
- Database modules are at: `Database/database/`
- Frontend files served from: `Frontend/` directory
- CSS files at: `Frontend/assets/css/`
- JS files at: `Frontend/assets/js/`

### Frontend Script References
All relative paths in HTML files:
```html
<!-- CSS -->
<link rel="stylesheet" href="assets/css/style.css">

<!-- JS -->
<script src="assets/js/auth.js"></script>
<script src="assets/js/script-api.js"></script>
```

---

## Configuration Files

### Backend Configuration
- **Port**: 5000 (default, configurable in app_mysql.py)
- **Database**: MySQL (configure in Database/database/db_manager.py)
- **CORS**: Enabled for all origins

### Database Configuration
- **MySQL Host**: localhost
- **MySQL Port**: 3306
- **Database Name**: aps_db
- See: `Database/database/schema.sql`

---

## Key Changes from Previous Structure

✅ **What Changed**:
- Moved CSS to `Frontend/assets/css/`
- Moved JS to `Frontend/assets/js/`
- Fixed Backend import paths for Database modules
- Created `__init__.py` for all Python packages
- Fixed Flask static folder pointing to Frontend
- Removed duplicate files (index.html, unified-app.html)
- Archived old app.py as app_old.py

✅ **Why**:
- Better code organization
- Cleaner asset management
- Proper Python package structure
- Easier deployment and maintenance

✅ **No Breaking Changes**:
- All API endpoints remain the same
- Database schema unchanged
- Authentication logic preserved
- All data files preserved

---

## Quick Reference

| Task | Command |
|------|---------|
| Start Backend | `cd Backend && python3 app_mysql.py` |
| Start MySQL | `mysql.server start` or Docker |
| Load Data | `python3 Database/database/data_loader.py` |
| Extract PDFs | `python3 Database/data_extraction/pdf_extractor.py` |
| Verify Setup | `./verify.sh` |
| Run Demo | `./run.sh` |

---

## Troubleshooting

- **Import Error**: Ensure `__init__.py` exists in all modules
- **Static Files 404**: Check Frontend asset paths in HTML files
- **Database Connection**: Verify MySQL is running and credentials in db_manager.py
- **CORS Issues**: Backend CORS is enabled; check browser console for details

See `docs/TROUBLESHOOTING.md` for more help.

---

**Last Updated**: 2024
**Project Status**: Reorganized - All functionality preserved ✓
