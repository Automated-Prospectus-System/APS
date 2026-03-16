#!/bin/bash

# APS MySQL Database Setup & Data Loading Script
# Automates: Database creation, schema initialization, data extraction and loading

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-aps_user}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-aps_system}
DB_ROOT_USER=${DB_ROOT_USER:-root}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# ============================================================================
# STEP 1: VERIFY PREREQUISITES
# ============================================================================

step_verify_prerequisites() {
    print_header "Step 1: Verifying Prerequisites"
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1)
        print_success "Python found: $PYTHON_VERSION"
    else
        print_error "Python 3 not found. Please install Python 3.8+"
        exit 1
    fi
    
    # Check MySQL
    if command -v mysql &> /dev/null; then
        print_success "MySQL client found"
    else
        print_error "MySQL client not found. Please install MySQL"
        exit 1
    fi
    
    # Check MySQL Server
    if mysql -h $DB_HOST -u $DB_ROOT_USER -p$DB_PASSWORD -e "SELECT 1" &> /dev/null; then
        print_success "MySQL server is running"
    else
        print_error "Cannot connect to MySQL server at $DB_HOST:$DB_PORT"
        print_info "Make sure MySQL is running: sudo service mysql start"
        exit 1
    fi
    
    echo ""
}

# ============================================================================
# STEP 2: CREATE DATABASE & USER
# ============================================================================

step_create_database() {
    print_header "Step 2: Setting Up Database"
    
    print_info "Creating database: $DB_NAME"
    
    mysql -h $DB_HOST -u $DB_ROOT_USER -p$DB_PASSWORD <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database setup complete';
MYSQL_SCRIPT
    
    if [ $? -eq 0 ]; then
        print_success "Database and user created successfully"
    else
        print_error "Failed to create database"
        exit 1
    fi
    
    echo ""
}

# ============================================================================
# STEP 3: INITIALIZE SCHEMA
# ============================================================================

step_initialize_schema() {
    print_header "Step 3: Initializing Database Schema"
    
    if [ ! -f "database/schema.sql" ]; then
        print_error "schema.sql not found in database/"
        exit 1
    fi
    
    print_info "Loading schema..."
    
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/schema.sql
    
    if [ $? -eq 0 ]; then
        print_success "Database schema initialized"
    else
        print_error "Failed to load schema"
        exit 1
    fi
    
    # Count tables
    TABLE_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES;" 2>/dev/null | wc -l)
    print_success "Created $TABLE_COUNT database objects"
    
    echo ""
}

# ============================================================================
# STEP 4: INSTALL PYTHON DEPENDENCIES
# ============================================================================

step_install_dependencies() {
    print_header "Step 4: Installing Python Dependencies"
    
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found"
        exit 1
    fi
    
    print_info "Installing packages from requirements.txt..."
    
    pip install -q -r requirements.txt
    
    if [ $? -eq 0 ]; then
        print_success "All dependencies installed"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    
    # Verify key packages
    python3 -c "import mysql.connector" && print_success "mysql-connector-python OK"
    python3 -c "import PyPDF2" && print_success "PyPDF2 OK"
    python3 -c "import bs4" && print_success "beautifulsoup4 OK"
    
    echo ""
}

# ============================================================================
# STEP 5: CREATE DATA EXTRACTION DIRECTORIES
# ============================================================================

step_create_directories() {
    print_header "Step 5: Creating Data Directories"
    
    mkdir -p data_extraction/prospectuses
    mkdir -p data_extraction/scraped_data
    mkdir -p data_extraction/extracted_data
    mkdir -p database
    
    print_success "Directories created"
    
    echo ""
}

# ============================================================================
# STEP 6: ENVIRONMENT CONFIGURATION
# ============================================================================

step_configure_environment() {
    print_header "Step 6: Configuring Environment"
    
    if [ ! -f ".env" ]; then
        print_info "Creating .env file..."
        
        cat > .env <<EOF
# APS Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Application
LOG_LEVEL=INFO
EOF
        
        print_success ".env file created"
    else
        print_info ".env file already exists"
    fi
    
    echo ""
}

# ============================================================================
# STEP 7: EXTRACT DATA FROM PDFS
# ============================================================================

step_extract_pdf_data() {
    print_header "Step 7: Extracting Data from PDFs"
    
    PDF_COUNT=$(ls data_extraction/prospectuses/*.pdf 2>/dev/null | wc -l)
    
    if [ $PDF_COUNT -eq 0 ]; then
        print_info "No PDF files found in data_extraction/prospectuses/"
        print_info "You can add PDFs later and re-run extraction"
        echo ""
        return
    fi
    
    print_info "Found $PDF_COUNT PDF file(s)"
    
    python3 data_extraction/pdf_extractor.py
    
    if [ -f "data_extraction/extracted_data.json" ]; then
        PROG_COUNT=$(python3 -c "import json; data=json.load(open('data_extraction/extracted_data.json')); print(sum(len(v) for v in data.values()))" 2>/dev/null || echo "unknown")
        print_success "Extracted $PROG_COUNT programs from PDFs"
    fi
    
    echo ""
}

# ============================================================================
# STEP 8: SCRAPE WEB DATA
# ============================================================================

step_scrape_web_data() {
    print_header "Step 8: Scraping University Websites"
    
    print_info "This may take a few minutes (respecting server load)..."
    
    python3 data_extraction/web_scraper.py
    
    if [ -f "data_extraction/scraped_data.json" ]; then
        PROG_COUNT=$(python3 -c "import json; data=json.load(open('data_extraction/scraped_data.json')); print(sum(len(v) for v in data.values()))" 2>/dev/null || echo "unknown")
        print_success "Scraped $PROG_COUNT programs from websites"
    fi
    
    echo ""
}

# ============================================================================
# STEP 9: LOAD DATA INTO DATABASE
# ============================================================================

step_load_data() {
    print_header "Step 9: Loading Data into Database"
    
    # Create temporary Python script to set environment
    python3 <<PYTHON_SCRIPT
import os
os.environ['DB_HOST'] = '$DB_HOST'
os.environ['DB_PORT'] = '$DB_PORT'
os.environ['DB_USER'] = '$DB_USER'
os.environ['DB_PASSWORD'] = '$DB_PASSWORD'
os.environ['DB_NAME'] = '$DB_NAME'

from database.data_loader import load_all_data
load_all_data()
PYTHON_SCRIPT
    
    if [ $? -eq 0 ]; then
        print_success "Data loading completed"
    else
        print_error "Data loading encountered errors"
    fi
    
    echo ""
}

# ============================================================================
# STEP 10: VERIFY DATABASE
# ============================================================================

step_verify_database() {
    print_header "Step 10: Verifying Database"
    
    # Count records
    UNIV_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) FROM universities;" 2>/dev/null | tail -1)
    PROG_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) FROM programs;" 2>/dev/null | tail -1)
    FIELD_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) FROM fields_of_study;" 2>/dev/null | tail -1)
    QUAL_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) FROM qualification_types;" 2>/dev/null | tail -1)
    
    print_success "Database Statistics:"
    echo "  Universities: $UNIV_COUNT"
    echo "  Programs: $PROG_COUNT"
    echo "  Fields of Study: $FIELD_COUNT"
    echo "  Qualification Types: $QUAL_COUNT"
    
    if [ "$PROG_COUNT" -gt 0 ]; then
        print_success "Database populated with data"
    else
        print_info "Database created but empty (add PDFs to data_extraction/prospectuses/)"
    fi
    
    echo ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    echo ""
    print_header "APS MYSQL DATABASE SETUP & DATA LOADING"
    echo ""
    echo "Configuration:"
    echo "  Host: $DB_HOST"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo ""
    
    # Run all steps
    step_verify_prerequisites
    step_create_database
    step_initialize_schema
    step_install_dependencies
    step_create_directories
    step_configure_environment
    
    # Optional: Extract and load data
    print_info "Data extraction steps (may take time):"
    print_info "1. Extracting from PDFs..."
    step_extract_pdf_data
    
    print_info "2. Scraping websites..."
    step_scrape_web_data
    
    print_info "3. Loading data into database..."
    step_load_data
    
    step_verify_database
    
    # Final summary
    print_header "✓ SETUP COMPLETE"
    echo ""
    echo "Next steps:"
    echo "  1. Start the backend:"
    echo "     python3 app_mysql.py"
    echo ""
    echo "  2. Open frontend in browser:"
    echo "     file:///$(pwd)/index.html"
    echo ""
    echo "  3. Test the API:"
    echo "     curl http://localhost:5000/api/health"
    echo ""
}

# Run main function
main
