#!/bin/bash

# APS - System Verification Script
# Checks if everything is setup correctly

# APS - Automatic Prospectus System - Quick Start Checklist
# Use this to verify everything is set up correctly

echo "╔════════════════════════════════════════════╗"
echo "║  🎓 APS System Verification Checklist      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

echo "Checking prerequisites..."
echo ""

# Check 1: Python Installation
echo -n "1. Python 3.8+ installed: "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    echo -e "${GREEN}✅ YES${NC} (Version: $PYTHON_VERSION)"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC}"
    ((FAILED++))
fi

# Check 2: Project Directory
echo -n "2. APS directory exists: "
if [ -d "/home/mokane/Desktop/APS" ]; then
    echo -e "${GREEN}✅ YES${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC}"
    ((FAILED++))
fi

# Check 3: requirements.txt
echo -n "3. requirements.txt exists: "
if [ -f "/home/mokane/Desktop/APS/requirements.txt" ]; then
    echo -e "${GREEN}✅ YES${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC}"
    ((FAILED++))
fi

# Check 4: app.py
echo -n "4. app.py exists: "
if [ -f "/home/mokane/Desktop/APS/app.py" ]; then
    echo -e "${GREEN}✅ YES${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC}"
    ((FAILED++))
fi

# Check 5: HTML files
echo -n "5. HTML pages exist: "
html_count=$(ls -1 /home/mokane/Desktop/APS/*.html 2>/dev/null | wc -l)
if [ "$html_count" -ge 4 ]; then
    echo -e "${GREEN}✅ YES${NC} ($html_count files)"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC} (Only $html_count files)"
    ((FAILED++))
fi

# Check 6: JavaScript files
echo -n "6. JavaScript files exist: "
js_count=$(ls -1 /home/mokane/Desktop/APS/*.js 2>/dev/null | wc -l)
if [ "$js_count" -ge 1 ]; then
    echo -e "${GREEN}✅ YES${NC} ($js_count files)"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC} (Only $js_count files)"
    ((FAILED++))
fi

# Check 7: CSS file
echo -n "7. style.css exists: "
if [ -f "/home/mokane/Desktop/APS/style.css" ]; then
    echo -e "${GREEN}✅ YES${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC}"
    ((FAILED++))
fi

# Check 8: Documentation
echo -n "8. Documentation exists: "
doc_count=$(ls -1 /home/mokane/Desktop/APS/*.md 2>/dev/null | wc -l)
if [ "$doc_count" -ge 2 ]; then
    echo -e "${GREEN}✅ YES${NC} ($doc_count files)"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC} (Only $doc_count files)"
    ((FAILED++))
fi

# Check 9: Startup scripts
echo -n "9. Startup scripts exist: "
if [ -f "/home/mokane/Desktop/APS/run.sh" ] || [ -f "/home/mokane/Desktop/APS/run.bat" ]; then
    echo -e "${GREEN}✅ YES${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC}"
    ((FAILED++))
fi

# Check 10: Flask is installed
echo -n "10. Flask module available: "
if python3 -c "import flask" 2>/dev/null; then
    echo -e "${GREEN}✅ YES${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC} (Run: pip install flask)"
    ((FAILED++))
fi

# Check 11: CORS is installed
echo -n "11. Flask-CORS module available: "
if python3 -c "import flask_cors" 2>/dev/null; then
    echo -e "${GREEN}✅ YES${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ NO${NC} (Run: pip install flask-cors)"
    ((FAILED++))
fi

echo ""
echo "════════════════════════════════════════════"
echo "Summary:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo "════════════════════════════════════════════"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to start.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run the backend: python3 app.py"
    echo "2. Open browser: file:///home/mokane/Desktop/APS/index.html"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "- Install Python 3.8+: sudo apt-get install python3"
    echo "- Install pip: sudo apt-get install python3-pip"
    echo "- Install dependencies: pip install -r requirements.txt"
    echo ""
    exit 1
fi
