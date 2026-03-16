# 🚀 Complete Setup Guide - Get APIs and Database Working

## ⏱️ Estimated Time: 20-30 minutes

---

## 📋 CHECKLIST

- [ ] Step 1: Install Python dependencies (5 min)
- [ ] Step 2: Setup MySQL database (10 min)
- [ ] Step 3: Load sample data (2 min)
- [ ] Step 4: Start Flask backend (1 min)
- [ ] Step 5: Test API endpoints (5 min)
- [ ] Step 6: Verify frontend communication (5 min)

---

## ✅ STEP 1: Install Python Dependencies

### Command:
```bash
cd /home/mokane/Desktop/APS
pip3 install -r requirements.txt
```

### What Gets Installed:
- Flask 2.3.3 (Web framework)
- Flask-CORS 4.0.0 (Enable API calls from frontend)
- mysql-connector-python 8.2.0 (MySQL connection)
- python-dotenv 1.0.0 (Environment variables)
- PyPDF2 4.0.1 (PDF extraction)
- requests 2.31.0 (Web requests)
- beautifulsoup4 4.12.2 (Web scraping)
- lxml 4.9.3 (XML parsing)

### Expected Output:
```
Successfully installed flask-2.3.3 flask-cors-4.0.0 mysql-connector-python-8.2.0 ...
```

### Estimated Time: ⏱️ 2-3 minutes

---

## ✅ STEP 2: Setup MySQL Database

### Sub-Step 2.1: Check MySQL Status
```bash
sudo systemctl status mysql
```

**Expected output should show:** `active (running)`

### Sub-Step 2.2: Start MySQL (if not running)
```bash
sudo systemctl start mysql
```

### Sub-Step 2.3: Verify MySQL Access
```bash
sudo mysql -u root -proot << EOF
SELECT VERSION();
EOF
```

**Note:** Adjust password if different than `root`

### Sub-Step 2.4: Create Database & Initialize Schema
```bash
sudo mysql -u root -proot << EOF
CREATE DATABASE aps_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aps_system;
source /home/mokane/Desktop/APS/database/schema.sql;
EOF
```

### Sub-Step 2.5: Verify Database Creation
```bash
sudo mysql -u root -proot -e "USE aps_system; SHOW TABLES;"
```

**Expected output:** List of 13 tables created

### Estimated Time: ⏱️ 5-10 minutes

---

## ✅ STEP 3: Load Sample Data (Optional but Recommended)

### Run Data Loader:
```bash
cd /home/mokane/Desktop/APS
python3 database/data_loader.py
```

### What This Does:
- ✅ Inserts 6 Lesotho universities
- ✅ Inserts sample programs
- ✅ Sets up qualification types
- ✅ Sets up study fields
- ✅ Creates grade scales

### Expected Output:
```
Loading universities...
✓ National University of Lesotho added
✓ Lerotholi Polytechnic added
... (more universities)
Data loaded successfully!
```

### Verify Data Loaded:
```bash
sudo mysql -u root -proot -e "USE aps_system; SELECT COUNT(*) FROM universities;"
```

**Expected:** `6` universities in database

### Estimated Time: ⏱️ 1-2 minutes

---

## ✅ STEP 4: Start Flask Backend Server

### Terminal 1: Start the Backend
```bash
cd /home/mokane/Desktop/APS
python3 app_mysql.py
```

### Expected Output:
```
 * Serving Flask app 'app'
 * Debug mode: off
 WARNING in werkzeug: This is a development server. 
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

**Keep this terminal open!** (Don't close while testing)

### Estimated Time: ⏱️ 1 minute

---

## ✅ STEP 5: Test API Endpoints

### Terminal 2: Test APIs (Keep Flask running in Terminal 1)

#### Test 5.1: Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "running",
  "timestamp": "2026-03-10T...",
  "version": "2.0",
  "database": "mysql"
}
```

#### Test 5.2: Get All Universities
```bash
curl http://localhost:5000/api/universities
```

**Expected Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {"id": 1, "name": "National University of Lesotho", ...},
    {"id": 2, "name": "Lerotholi Polytechnic", ...},
    ...
  ]
}
```

#### Test 5.3: Get All Programs
```bash
curl http://localhost:5000/api/programs
```

**Expected Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {"id": 1, "name": "Bachelor of Science", ...},
    ...
  ]
}
```

#### Test 5.4: Filter Programs by Field
```bash
curl "http://localhost:5000/api/programs?field=Engineering"
```

#### Test 5.5: Search Universities
```bash
curl "http://localhost:5000/api/universities?search=National"
```

**Expected:** Returns only NUL

### Estimated Time: ⏱️ 2-3 minutes

---

## ✅ STEP 6: Verify Frontend-Backend Communication

### In Web Browser (with Flask still running):

#### Step 6.1: Open DevTools
1. Open `file:///home/mokane/Desktop/APS/home.html`
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Go to **Network** tab

#### Step 6.2: Load a Page
1. Refresh the page (F5)
2. Look in **Network** tab for API calls to `localhost:5000`

#### Step 6.3: Monitor Real-Time Requests
1. Click something that filters data (e.g., filter programs)
2. Watch Network tab for API request
3. Verify response contains real database data

#### Step 6.4: Check Browser Console
1. Go to **Console** tab
2. Should NOT see `Error fetching` messages
3. Should see successful data loads

**Example Good Console Output:**
```
✓ Loaded 6 universities from API
✓ Loaded 15 programs from API
✓ University logos displaying
```

### Estimated Time: ⏱️ 3-5 minutes

---

## 🧪 FULL INTEGRATION TEST

Once all steps complete, try this full workflow:

### Test Scenario 1: Login → View Universities
```
1. Open login.html
2. Login with admin/admin123
3. See home.html with 6 universities
4. Universities should load from DATABASE (not fallback)
5. Open DevTools Network tab
6. See http://localhost:5000/api/universities call
```

### Test Scenario 2: Filter Programs
```
1. Go to Programs page
2. Filter by "Engineering"
3. Should show only engineering programs from DATABASE
4. DevTools shows: http://localhost:5000/api/programs?field=Engineering
```

### Test Scenario 3: Search Universities
```
1. Go to Universities page
2. Search "National"
3. Database returns only NUL
4. DevTools shows: http://localhost:5000/api/universities?search=National
```

### Test Scenario 4: Check Eligibility
```
1. Fill eligibility form on Home page
2. Click "Check Eligibility"
3. Backend calculates and returns results
4. DevTools shows POST to /api/eligibility
```

---

## ⚠️ TROUBLESHOOTING

### Issue 1: "Connection refused" for API
**Problem:** Backend not running  
**Solution:** Make sure Flask is running in another terminal (Step 4)

### Issue 2: "ModuleNotFoundError: No module named 'flask'"
**Problem:** Dependencies not installed  
**Solution:** Run Step 1 again with `pip3 install -r requirements.txt`

### Issue 3: "MySQL Access Denied"
**Problem:** Wrong password or MySQL not running  
**Solution:** Check MySQL status with `sudo systemctl status mysql`

### Issue 4: "Database 'aps_system' doesn't exist"
**Problem:** Schema not loaded  
**Solution:** Rerun Step 2.4 to create database and schema

### Issue 5: "API returns empty data"
**Problem:** Sample data not loaded  
**Solution:** Run Step 3 data loader: `python3 database/data_loader.py`

### Issue 6: "Backend starts but crashes"
**Problem:** Database connection failed  
**Solution:** Check MySQL is running: `sudo systemctl status mysql`

---

## 🔍 VERIFICATION CHECKLIST

After completing all steps, verify:

| Component | Check | Status |
|-----------|-------|--------|
| Python Dependencies | `pip3 list \| grep -i flask` | ✅ Flask installed |
| MySQL Running | `sudo systemctl status mysql` | ✅ Active (running) |
| Database Created | `mysql -u root aps_system -e "SHOW TABLES;"` | ✅ 13 tables shown |
| Sample Data | `mysql -u root aps_system -e "SELECT COUNT(*) FROM universities;"` | ✅ 6 universities |
| Flask Running | `curl http://localhost:5000/api/health` | ✅ Returns JSON |
| Frontend Works | Open login.html, logout, login | ✅ Authentication OK |
| API Calls Work | Check DevTools Network tab | ✅ Requests to API |
| Database Populates | Filter programs, should show DB data | ✅ Real data shown |

---

## 📊 EXPECTED FINAL STATE

After successful setup:

```
FRONTEND (http://localhost:5000 from file://)
    ↓ (API calls)
    ↓
BACKEND (Flask app_mysql.py running on localhost:5000)
    ├─ /api/health                  ✅ Working
    ├─ /api/universities            ✅ Working
    ├─ /api/programs                ✅ Working
    ├─ /api/eligibility             ✅ Working
    └─ [other endpoints]            ✅ Working
    ↓ (SQL queries)
    ↓
DATABASE (MySQL aps_system)
    ├─ universities table           ✅ Data loaded
    ├─ programs table               ✅ Data loaded
    ├─ faculties table              ✅ Data loaded
    └─ [other tables]               ✅ Schema ready
```

---

## 🎉 SUCCESS INDICATORS

You'll know everything is working when:

1. ✅ Flask starts without errors
2. ✅ `curl http://localhost:5000/api/health` returns `"database": "mysql"`
3. ✅ Universities page shows 6 universities (from database)
4. ✅ DevTools Network tab shows API calls to `localhost:5000`
5. ✅ Filters and searches work with database data
6. ✅ Eligibility checker processes requests

---

## ⏱️ QUICK REFERENCE

### Start Everything (in order):
```bash
# Terminal 1: Start MySQL
sudo systemctl start mysql

# Terminal 2: Start Flask
python3 /home/mokane/Desktop/APS/app_mysql.py

# Terminal 3: Test (one-time)
curl http://localhost:5000/api/health
```

### Daily Use:
```bash
# Day 1+: Only need to run
sudo systemctl start mysql
python3 /home/mokane/Desktop/APS/app_mysql.py
```

---

**Estimated Total Setup Time:** ~20-30 minutes  
**Complexity Level:** Beginner-friendly  
**Support Files:** API_DIAGNOSTIC_REPORT.md in project folder

Good luck! 🚀
