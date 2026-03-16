# APS System - Troubleshooting Guide

## Before You Start

Run the verification script to check all prerequisites:
```bash
bash verify.sh
```

---

## Backend Issues

### Problem: "ModuleNotFoundError: No module named 'flask'"

**Symptoms**: Running `python3 app.py` produces this error

**Solutions**:
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Or install individually:
   ```bash
   pip install Flask==2.3.3
   pip install Flask-CORS==4.0.0
   pip install python-dotenv==1.0.0
   ```
3. Verify Flask is installed:
   ```bash
   python3 -m pip list | grep -i flask
   ```

---

### Problem: "Port 5000 is already in use"

**Symptoms**: Error appears when starting backend, mentions "Address already in use"

**Solutions**:

**On Linux/macOS**:
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or use the automatic kill:
fuser -k 5000/tcp
```

**On Windows**:
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Alternative**: 
- Modify `app.py` to use a different port (change `port=5000` to `port=5001`)

---

### Problem: Backend starts but shows no routes

**Symptoms**: Server runs but endpoints return 404 errors

**Solutions**:
1. Check startup message - should show 8 API routes listed
2. Verify `app.py` file is not corrupted:
   ```bash
   python3 -c "import ast; ast.parse(open('app.py').read())"
   ```
3. Restart the server:
   ```bash
   # Stop current server (Ctrl+C in terminal)
   python3 app.py
   ```

---

## Frontend Issues

### Problem: "404 Not Found" when opening HTML file

**Symptoms**: Browser shows error when opening `index.html`

**Solutions**:
1. **Correct path**: Use the full file path:
   ```
   file:///home/mokane/Desktop/APS/index.html
   ```
   Note: Three slashes after `file:`

2. **Using Python server** (recommended):
   ```bash
   cd /home/mokane/Desktop/APS
   python3 -m http.server 8000
   # Then open: http://localhost:8000
   ```

3. **Verify file exists**:
   ```bash
   ls -lah *.html
   ```

---

### Problem: Eligibility checker shows no results

**Symptoms**: Click "Check Eligibility" but nothing happens or shows "No eligible programs"

**Causes & Solutions**:

1. **Backend not running**:
   - Start backend: `python3 app.py`
   - Check error console (F12 in browser)

2. **Invalid grades entered**:
   - Grades must be: A, B, C, D, or E (uppercase)
   - Not valid: lowercase letters, numbers, symbols

3. **Missing subjects**:
   - Must enter at least 4 subjects
   - Click "Add Subject" to add more

4. **API connection issue**:
   - Open browser console (F12 → Console)
   - Check for red error messages
   - Try accessing API directly: `http://localhost:5000/api/health`

---

### Problem: Filter dropdowns are empty

**Symptoms**: When opening programs.html, filter dropdowns show no options

**Solutions**:
1. Backend is not running → Start it:
   ```bash
   python3 app.py
   ```
2. Check browser console (F12) for API errors
3. Manually check API endpoint:
   ```bash
   curl http://localhost:5000/api/fields
   curl http://localhost:5000/api/qualifications
   ```

---

### Problem: University logos/icons not showing

**Symptoms**: University cards show placeholder icons instead of Font Awesome icons

**Causes & Solutions**:

1. **Font Awesome CDN not loading**:
   - Check internet connection
   - Look at browser console for 404 errors
   - Verify HTML file includes Font Awesome link:
     ```html
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
     ```

2. **CSS class names wrong**:
   - Should be: `<i class="fas fa-building"></i>`
   - Font Awesome CSS is loaded correctly if you see any icons at all

3. **Offline mode**:
   - Font Awesome requires internet to load from CDN
   - Use `python3 -m http.server` and ensure internet connection

---

### Problem: Styling looks wrong (misaligned text, bad colors)

**Symptoms**: Page displays but layout is broken or colors are wrong

**Solutions**:
1. **Hard refresh browser** (clear cache):
   - **Windows/Linux**: Ctrl+Shift+R
   - **Mac**: Cmd+Shift+R
   - **Or**: Delete browser cache for localhost

2. **Verify CSS file exists and loads**:
   ```bash
   ls -lah style.css
   # Should show file size of ~18KB
   ```

3. **Check browser console** (F12 → Console):
   - Look for CSS file 404 errors
   - Check for JavaScript errors that might affect layout

---

## API Issues

### Problem: API returns 500 Internal Server Error

**Symptoms**: API endpoints return HTTP 500 error

**Solutions**:
1. **Check backend console output**:
   - Look for Python error messages when you make the request
   - Stack trace will show what failed

2. **Verify JSON format in requests**:
   - POST requests must have valid JSON
   - Test with curl:
     ```bash
     curl -X POST http://localhost:5000/api/eligibility \
       -H "Content-Type: application/json" \
       -d '{"subjects": [{"subject":"Math","grade":"A"}]}'
     ```

3. **Check for missing required fields**:
   - Eligibility check requires: `subjects` array
   - Each subject needs: `subject` name, `grade` value

---

### Problem: CORS errors in browser console

**Symptoms**: Error like "Access to XMLHttpRequest blocked by CORS policy"

**Solutions**:
1. **Verify Flask-CORS is installed**:
   ```bash
   pip install Flask-CORS==4.0.0
   ```

2. **Restart backend** (must be done after pip install):
   ```bash
   # Stop current server (Ctrl+C)
   python3 app.py
   ```

3. **Check that CORS is enabled in app.py**:
   - Line should have: `CORS(app)`

4. **If issue persists**:
   - Use Python HTTP server for frontend:
     ```bash
     python3 -m http.server 8000
     ```
   - Access frontend via: `http://localhost:8000`

---

### Problem: No data in API responses

**Symptoms**: API returns empty arrays `[]`

**Solutions**:
1. **Check app.py data**:
   - File should contain in-memory data (universitiesData, programsData arrays)
   - Verify file size is ~20KB

2. **Verify endpoints are filtering correctly**:
   - Test without filters first:
     ```bash
     curl http://localhost:5000/api/universities
     ```
   - Then with filters:
     ```bash
     curl "http://localhost:5000/api/universities?search=National"
     ```

3. **Check logs in backend console**:
   - When you make requests, backend logs what it returns

---

## Multi-Page Navigation Issues

### Problem: Links between pages don't work

**Symptoms**: Clicking "Home" or "Programs" links go to blank page

**Solutions**:
1. **Using file:// protocol**:
   - File links only work between files in same directory
   - Use relative links:
     ```html
     <!-- Correct -->
     <a href="index.html">Home</a>
     <a href="programs.html">Programs</a>
     
     <!-- Wrong -->
     <a href="/home/mokane/Desktop/APS/index.html">Home</a>
     ```

2. **Using Python HTTP server** (recommended):
   ```bash
   python3 -m http.server 8000
   # Access: http://localhost:8000
   ```

3. **Using a browser server** (Firefox, Chrome):
   - Install and use Live Server extension
   - Right-click → "Open with Live Server"

---

## Database Integration Issues (When Ready)

### Problem: "Column not found" when querying database

**Symptoms**: Appears when database is added

**Solutions**:
1. Verify database schema matches field names in `app.py`
2. Update column names in ORM models
3. Restart backend after database changes

---

## General Diagnostics

### Check Everything is Working:

```bash
# 1. Check Python version
python3 --version
# Should be 3.8 or higher

# 2. Check project files
ls -lah /home/mokane/Desktop/APS/
# Should show ~16 files

# 3. Verify Flask is running
python3 app.py
# Watch for: "Running on http://127.0.0.1:5000" (don't close this terminal)

# 4. In another terminal, test API
curl http://localhost:5000/api/health
# Should return: {"status": "running", "timestamp": "..."}

# 5. Open HTML file
# Firefox/Chrome URL bar: file:///home/mokane/Desktop/APS/index.html
```

---

## Emergency Reset

If nothing is working, try a clean restart:

```bash
# 1. Stop all servers (Ctrl+C in any running terminal)

# 2. Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} +
find . -name "*.pyc" -delete

# 3. Reinstall dependencies
pip install --upgrade -r requirements.txt

# 4. Restart backend
python3 app.py

# 5. Clear browser cache
# Firefox: Ctrl+Shift+Del
# Chrome: Ctrl+Shift+Delete

# 6. Open frontend in new browser tab
# file:///home/mokane/Desktop/APS/index.html
```

---

## Need More Help?

### Check These Files:
- **API Documentation**: [API_REFERENCE.md](API_REFERENCE.md)
- **Setup Guide**: [STARTUP_GUIDE.md](STARTUP_GUIDE.md)
- **Main README**: [README.md](README.md)
- **Project Summary**: [PROJECT_SUMMARY.txt](PROJECT_SUMMARY.txt)

### Test Your Setup:
```bash
# Run verification script
bash verify.sh
```

### Common Success Indicators:
- ✅ Backend console shows: `Running on http://127.0.0.1:5000`
- ✅ Browser shows color-coded pages with icons
- ✅ Entering grades and clicking "Check Eligibility" shows results
- ✅ Filters on Programs page have dropdown options
- ✅ Search on Universities page returns results

---

**Last Updated**: 2024-01-15  
**Status**: Ready for troubleshooting  
**Questions?**: Check the API_REFERENCE.md and STARTUP_GUIDE.md files
