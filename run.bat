@echo off
REM APS - Automatic Prospectus System
REM Startup script for Windows

echo.
echo ╔═════════════════════════════════════════════╗
echo ║  🎓 APS - Automatic Prospectus System      ║
echo ║     Backend Startup Script                 ║
echo ╚═════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo ✅ Python found:
python --version
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

echo 📁 Project directory: %cd%
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment found
)

echo.

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

echo.

REM Check if requirements are installed
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing dependencies...
    pip install -r requirements.txt
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo ═════════════════════════════════════════════
echo.

REM Start the Flask server
echo 🚀 Starting APS Backend Server...
echo 📡 Server will run on: http://localhost:5000
echo.
echo 📝 Instructions:
echo   1. Keep this window open
echo   2. Open your browser and go to:
echo      file:///C:/path/to/APS/index.html
echo      OR
echo      http://localhost:8000 (if using Python's http.server^)
echo.
echo   3. To stop the server, press Ctrl+C
echo.
echo ═════════════════════════════════════════════
echo.

REM Run the Flask app
python app.py

pause
