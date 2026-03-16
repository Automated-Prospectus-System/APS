#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# APS - Automatic Prospectus System
# Simple Startup Script that fixes common issues
# ═══════════════════════════════════════════════════════════════════

echo "╔═════════════════════════════════════════════════════════╗"
echo "║  🎓 APS - Automatic Prospectus System                  ║"
echo "║     Application Startup                                ║"
echo "╚═════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Project directory: $SCRIPT_DIR"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python 3 found${NC}: $(python3 --version)"
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "🔄 Activating virtual environment..."
    source venv/bin/activate
    PYTHON_CMD="python"
else
    PYTHON_CMD="python3"
fi
echo ""

# Check if Flask is installed
if ! $PYTHON_CMD -c "import flask" 2>/dev/null; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    if [ -f "Backend/requirements.txt" ]; then
        pip install -r Backend/requirements.txt
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    fi
else
    echo -e "${GREEN}✅ Dependencies are already installed${NC}"
fi
echo ""

# Check MySQL availability
echo "🗄️  Checking MySQL..."
DB_MODE="development"
if command -v mysql &> /dev/null; then
    if mysqladmin ping -u root 2>/dev/null || mysqladmin ping -uroot 2>/dev/null; then
        echo -e "${GREEN}✅ MySQL is available${NC}"
        DB_MODE="production"
    else
        echo -e "${YELLOW}⚠️  MySQL not responding. Running in development mode.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MySQL not found. Running in development mode.${NC}"
fi
echo ""

# Start the application
echo -e "${GREEN}🚀 Starting APS Backend on http://localhost:5000${NC}"
echo "📊 Mode: $DB_MODE"
echo ""
echo "═════════════════════════════════════════════════════════"
echo "Open your browser and go to:"
echo "   http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "═════════════════════════════════════════════════════════"
echo ""

# Run the Flask app (use dev version for fallback)
cd Backend
$PYTHON_CMD app_dev.py
