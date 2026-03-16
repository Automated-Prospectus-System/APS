# 🚀 APS - Automatic Prospectus System - Startup Guide

Welcome to the APS Backend! Follow these steps to get started.

## 📋 Prerequisites

Before you begin, ensure you have:
- Python 3.8 or higher installed
- pip (Python package manager)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Terminal/Command Prompt access

## ✅ Checking Prerequisites

### Check Python Installation
```bash
python --version
# or
python3 --version
```

You should see: `Python 3.8.x` or higher

### Check pip Installation
```bash
pip --version
# or
pip3 --version
```

## 🚀 Quick Start (Recommended)

### Option 1: Automatic Setup (Linux/macOS)

1. **Make the startup script executable:**
   ```bash
   chmod +x run.sh
   ```

2. **Run the startup script:**
   ```bash
   ./run.sh
   ```

   This will automatically:
   - Check Python installation
   - Create a virtual environment
   - Install dependencies
   - Start the backend server

3. **Open the frontend:**
   - Open your browser and go to: `file:///home/mokane/Desktop/APS/index.html`
   - Or use a local web server: `python3 -m http.server 8000` in another terminal

### Option 2: Automatic Setup (Windows)

1. **Run the startup script:**
   - Double-click `run.bat`

   This will automatically:
   - Check Python installation
   - Create a virtual environment
   - Install dependencies
   - Start the backend server

2. **Open the frontend:**
   - Open your browser and go to: `file:///C:/path/to/APS/index.html`

## 📱 Manual Setup (All Platforms)

If the automatic setup doesn't work, follow these steps:

### Step 1: Navigate to Project Directory
```bash
cd /home/mokane/Desktop/APS
```

### Step 2: Create Virtual Environment (Optional but Recommended)
```bash
python -m venv venv
```

### Step 3: Activate Virtual Environment

**On Linux/macOS:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate.bat
```

You should see `(venv)` at the beginning of your terminal prompt.

### Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```

Expected output:
```
Successfully installed Flask-2.3.3 Flask-CORS-4.0.0 python-dotenv-1.0.0
```

### Step 5: Run the Backend
```bash
python app.py
```

Expected output:
```
==================================================
🎓 APS - Automatic Prospectus System
Backend Server Started
==================================================

📡 API Documentation:
  GET  /api/health               - Health check
  GET  /api/universities         - Get all universities
  GET  /api/universities/<id>    - Get single university
  GET  /api/programs             - Get all programs
  GET  /api/programs/<id>        - Get single program
  POST /api/eligibility          - Check eligibility
  GET  /api/fields               - Get all fields of study
  GET  /api/qualifications       - Get all qualifications

🌐 Server running on http://localhost:5000
==================================================
```

## 🌐 Accessing the Frontend

### Option A: Direct File Access
```
file:///home/mokane/Desktop/APS/index.html
```

### Option B: Using Python's Built-in Server (Recommended)

Open a NEW terminal window and run:
```bash
cd /home/mokane/Desktop/APS
python -m http.server 8000
```

Then open your browser to:
```
http://localhost:8000
```

## ✅ Verifying Everything Works

### Step 1: Check Backend Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "success",
  "message": "APS Backend is running",
  "timestamp": "2026-03-10T..."
}
```

### Step 2: Test Universities API
```bash
curl http://localhost:5000/api/universities
```

Expected response:
```json
{
  "status": "success",
  "data": [
    {
      "id": "nul",
      "name": "National University of Lesotho",
      ...
    },
    ...
  ],
  "total": 6
}
```

### Step 3: Test Programs API
```bash
curl http://localhost:5000/api/programs
```

### Step 4: Open Frontend in Browser
- Go to `http://localhost:8000`
- Check browser console for any errors (Press F12)
- Test the eligibility checker form

## 🐛 Troubleshooting

### Issue: "Python not found"
**Solution:**
```bash
# Use python3 instead
python3 app.py

# Or add Python to PATH (Windows)
# Search for "Environment Variables" and add Python installation path
```

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Use a different port
python app.py --host=0.0.0.0 --port=5001

# On Linux/macOS, find and kill the process
lsof -i :5000
kill -9 <PID>

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "ModuleNotFoundError: No module named 'flask'"
**Solution:**
```bash
# Make sure virtual environment is activated
# Then reinstall dependencies
pip uninstall -r requirements.txt
pip install -r requirements.txt
```

### Issue: "CORS error" or "No 'Access-Control-Allow-Origin' header"
**Solution:**
- Make sure backend is running on `http://localhost:5000`
- Make sure frontend is accessing `http://localhost:5000/api`
- Check browser console (F12) for specific error messages
- Backend already has CORS enabled, but verify CORS is not blocked by firewall

### Issue: Frontend shows "No data" or "Loading..."
**Solution:**
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Check if API requests are being made
4. Look for red error messages in Console tab
5. Verify backend is running and accessible

## 📝 API Testing

### Using curl

**Get all universities:**
```bash
curl "http://localhost:5000/api/universities"
```

**Get programs in Science & Technology:**
```bash
curl "http://localhost:5000/api/programs?field=Science%20%26%20Technology"
```

**Check eligibility:**
```bash
curl -X POST http://localhost:5000/api/eligibility \
  -H "Content-Type: application/json" \
  -d '{
    "subjects": [
      {"subject": "Mathematics", "grade": "A"},
      {"subject": "English", "grade": "B"},
      {"subject": "Physical Science", "grade": "C"}
    ]
  }'
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API:
   - Click "Import"
   - Paste: `http://localhost:5000/api/health`
3. Create requests for each endpoint
4. Save to collection for easy testing

## 🎓 Testing the System

### Test Case 1: Check Eligibility
1. Go to Home page
2. Fill in exam results:
   - Mathematics: A
   - English: B
   - Physical Science: C
3. Click "Search Programs"
4. Should see eligible programs

### Test Case 2: Browse Programs
1. Go to Programs page
2. Filter by "Science & Technology"
3. View program details
4. Verify information displays correctly

### Test Case 3: Search Universities
1. Go to Universities page
2. Search for "National"
3. Should find National University of Lesotho
4. Click View Details

## 🔄 Switching Versions

We have two versions of JavaScript:

- `script.js` - Uses local data (doesn't require backend)
- `script-api.js` - Uses backend API (requires backend running)

Currently, all HTML files use `script-api.js` which requires the backend.

To use local data mode, change in each HTML file:
```html
<script src="script-api.js"></script>
<!-- Change to -->
<script src="script.js"></script>
```

## 🛑 Stopping the Server

### In Terminal
Press: `Ctrl + C`

### Check if Server Still Running
```bash
curl http://localhost:5000/api/health
```

If you get "Connection refused", the server has stopped.

## 📚 Next Steps

1. **Database Integration**: Replace in-memory data with a real database
2. **Admin Dashboard**: Implement admin panel for managing data
3. **Authentication**: Add user login and registration
4. **Email Notifications**: Send eligibility results to email
5. **PDF Export**: Generate eligibility reports as PDF

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Check the browser console (F12 → Console tab)
3. Read the README.md file
4. Check the API documentation in app.py

## 🎉 You're All Set!

The APS Backend is now ready to use. Enjoy exploring the Automatic Prospectus System!

---

**Last Updated:** March 10, 2026
**Version:** 1.0.0
