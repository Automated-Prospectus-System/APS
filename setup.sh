#!/bin/bash

# Complete APS System Setup Script
# Sets up database, loads sample data, and starts backend

echo "=================================="
echo "🚀 APS System Complete Setup"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Setup working directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}Step 1: Checking Python dependencies...${NC}"
python3 -c "import flask; import flask_cors; import mysql.connector" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All Python dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Installing Python dependencies...${NC}"
    pip3 install -q -r Backend/requirements.txt
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Setting up MySQL database...${NC}"

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo -e "${YELLOW}Starting MySQL server...${NC}"
    sudo systemctl start mysql 2>/dev/null || echo -e "${RED}Note: May need password to start MySQL${NC}"
    sleep 2
fi

# Try to connect without password first
mysql -u root -e "SELECT 1" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ MySQL connection OK (no password)${NC}"
    
    # Create database and tables
    echo -e "${YELLOW}Creating database and tables...${NC}"
    mysql -u root << EOF
DROP DATABASE IF EXISTS aps_system;
CREATE DATABASE aps_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aps_system;
EOF
    
    # Import schema
    if [ -f "Database/database/schema.sql" ]; then
        mysql -u root aps_system < Database/database/schema.sql
        echo -e "${GREEN}✓ Database schema created${NC}"
    fi
    
    # Verify database creation
    TABLE_COUNT=$(mysql -u root aps_system -e "SHOW TABLES;" 2>/dev/null | wc -l)
    if [ "$TABLE_COUNT" -gt 1 ]; then
        echo -e "${GREEN}✓ Tables created: $(mysql -u root aps_system -e "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema='aps_system';" 2>/dev/null | tail -1)${NC}"
    fi
else
    echo -e "${RED}✗ Could not connect to MySQL${NC}"
    echo -e "${YELLOW}Note: Ensure MySQL is running with: sudo systemctl start mysql${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Loading sample data...${NC}"

# Load sample data using Python
python3 << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, './Database/database')

try:
    from db_manager import DatabaseManager
    
    db = DatabaseManager()
    if db.connect():
        print("✓ Connected to database")
        
        # Insert universities
        universities = [
            {
                'name': 'National University of Lesotho',
                'country': 'Lesotho',
                'city': 'Roma',
                'email': 'admin@nul.ls',
                'website': 'https://nul.ls/',
                'description': 'The premier public university offering multiple faculties'
            },
            {
                'name': 'Lerotholi Polytechnic',
                'country': 'Lesotho',
                'city': 'Maseru',
                'email': 'admissions@lp.ac.ls',
                'website': 'https://www.lp.ac.ls/',
                'description': 'Technical and vocational training institution'
            },
            {
                'name': 'Lesotho College of Education',
                'country': 'Lesotho',
                'city': 'Maseru',
                'email': 'info@lce.ac.ls',
                'website': 'http://www.lce.ac.ls/',
                'description': 'Leading institution for teacher education'
            },
            {
                'name': 'Botho University Lesotho',
                'country': 'Lesotho',
                'city': 'Maseru',
                'email': 'admissions@botho.ls',
                'website': 'https://lesotho.bothouniversity.com/',
                'description': 'Private university offering business and IT programs'
            },
            {
                'name': 'Limkokwing University',
                'country': 'Lesotho',
                'city': 'Maseru',
                'email': 'info@limkokwing.net',
                'website': 'https://www.limkokwing.net/lesotho/',
                'description': 'Creative and digital media focused institution'
            },
            {
                'name': 'African University College',
                'country': 'Lesotho',
                'city': 'Maseru',
                'email': 'admissions@auc.ac.ls',
                'website': 'https://www.aucc.ac.ls/',
                'description': 'Pan-African institution promoting higher education'
            }
        ]
        
        for uni in universities:
            db.add_university(uni)
        print(f"✓ Loaded {len(universities)} universities")
        
        db.disconnect()
    else:
        print("✗ Failed to connect to database")
except Exception as e:
    print(f"✗ Error loading data: {e}")

PYTHON_SCRIPT

echo ""
echo -e "${GREEN}=================================="
echo "✓ Setup Complete!"
echo "==================================${NC}"
echo ""
echo -e "${YELLOW}To start the backend server, run:${NC}"
echo "  cd /home/mokane/Desktop/APS"
echo "  python3 app_mysql.py"
echo ""
echo -e "${YELLOW}Then open in browser:${NC}"
echo "  file:///home/mokane/Desktop/APS/login.html"
echo ""
echo -e "${YELLOW}Login with:${NC}"
echo "  Username: admin"
echo "  Password: admin123"
