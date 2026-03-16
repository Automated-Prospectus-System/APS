#!/usr/bin/env python3
"""
APS System - MySQL Database Initialization & Migration
Automatically sets up MySQL database and loads seed data on first run
"""

import os
import json
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'aps_user'),
    'password': os.getenv('DB_PASSWORD', 'APS@Secure2026#Ls!'),
    'database': os.getenv('DB_NAME', 'aps_system')
}

DB_ROOT_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_ROOT_USER', 'root'),
    'password': os.getenv('DB_ROOT_PASSWORD', '')
}


def load_seed_data():
    """Load seed data from data_seed.json"""
    try:
        seed_path = Path(__file__).parent.parent / 'data_seed.json'
        if not seed_path.exists():
            logger.error(f"Seed file not found: {seed_path}")
            return None
        
        with open(seed_path, 'r') as f:
            data = json.load(f)
            logger.info(f"✓ Loaded seed data: {len(data.get('universities', []))} universities, {len(data.get('programs', []))} programs")
            return data
    except Exception as e:
        logger.error(f"Failed to load seed data: {e}")
        return None


def load_users_data():
    """Load user data from users.json"""
    try:
        users_path = Path(__file__).parent.parent / 'users.json'
        if not users_path.exists():
            logger.warning(f"Users file not found: {users_path}")
            return {}
        
        with open(users_path, 'r') as f:
            users = json.load(f)
            logger.info(f"✓ Loaded user data: {len(users)} users")
            return users
    except Exception as e:
        logger.error(f"Failed to load users data: {e}")
        return {}


def create_database():
    """Create database and user if they don't exist"""
    try:
        import mysql.connector
        
        logger.info("🔧 Creating MySQL database and user...")
        
        # Connect as root
        root_conn = mysql.connector.connect(**DB_ROOT_CONFIG)
        cursor = root_conn.cursor()
        
        # Create database
        db_name = DB_CONFIG['database']
        db_user = DB_CONFIG['user']
        db_pass = DB_CONFIG['password']
        
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        logger.info(f"✓ Database '{db_name}' created/exists")
        
        # Create user and grant privileges
        cursor.execute(f"CREATE USER IF NOT EXISTS '{db_user}'@'localhost' IDENTIFIED BY '{db_pass}'")
        cursor.execute(f"GRANT ALL PRIVILEGES ON {db_name}.* TO '{db_user}'@'localhost'")
        cursor.execute("FLUSH PRIVILEGES")
        logger.info(f"✓ User '{db_user}' created/exists with privileges granted")
        
        cursor.close()
        root_conn.close()
        
        return True
    except Exception as e:
        logger.error(f"✗ Failed to create database: {e}")
        return False


def create_schema():
    """Create database tables from schema.sql"""
    try:
        import mysql.connector
        
        logger.info("📋 Creating database schema...")
        
        schema_path = Path(__file__).parent / 'schema.sql'
        if not schema_path.exists():
            logger.error(f"Schema file not found: {schema_path}")
            return False
        
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Connect as app user
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Execute schema SQL statements
        for statement in schema_sql.split(';'):
            statement = statement.strip()
            if statement:
                try:
                    cursor.execute(statement)
                except mysql.connector.Error as e:
                    if 'already exists' in str(e):
                        logger.info(f"  ℹ Table already exists (skipping)")
                    else:
                        logger.warning(f"  ⚠ {e}")
        
        conn.commit()
        logger.info("✓ Database schema created/verified")
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        logger.error(f"✗ Failed to create schema: {e}")
        return False


def load_seed_into_mysql():
    """Load seed data into MySQL database"""
    try:
        import mysql.connector
        
        logger.info("📥 Loading seed data into MySQL...")
        
        seed_data = load_seed_data()
        if not seed_data:
            logger.warning("⚠ No seed data available, skipping...")
            return False
        
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Load universities
        universities = seed_data.get('universities', [])
        for uni in universities:
            try:
                query = """
                INSERT IGNORE INTO universities 
                (name, country, city, description, website, email, phone)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(query, (
                    uni.get('name'),
                    uni.get('country', 'Lesotho'),
                    uni.get('city'),
                    uni.get('description'),
                    uni.get('website'),
                    uni.get('email'),
                    uni.get('phone')
                ))
            except Exception as e:
                logger.warning(f"  ⚠ Failed to insert university: {e}")
        
        conn.commit()
        logger.info(f"✓ Loaded {len(universities)} universities")
        
        # Load programs
        programs = seed_data.get('programs', [])
        for prog in programs:
            try:
                query = """
                INSERT IGNORE INTO programs 
                (university_id, name, field_of_study, qualification_type, duration_years, description, minimum_score)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(query, (
                    prog.get('university_id'),
                    prog.get('name'),
                    prog.get('field_of_study'),
                    prog.get('qualification_type'),
                    prog.get('duration_years'),
                    prog.get('description'),
                    prog.get('minimum_score')
                ))
            except Exception as e:
                logger.warning(f"  ⚠ Failed to insert program: {e}")
        
        conn.commit()
        logger.info(f"✓ Loaded {len(programs)} programs")
        
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        logger.error(f"✗ Failed to load seed data: {e}")
        return False


def verify_mysql_connection():
    """Verify MySQL connection works"""
    try:
        import mysql.connector
        
        logger.info("🔗 Verifying MySQL connection...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM universities")
        result = cursor.fetchone()
        count = result[0] if result else 0
        logger.info(f"✓ MySQL connection successful - {count} universities in database")
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        logger.error(f"✗ MySQL connection failed: {e}")
        return False


def main():
    """Run full initialization"""
    logger.info("🚀 APS System - Database Initialization")
    logger.info(f"   Database: {DB_CONFIG['database']} @ {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    logger.info("")
    
    # Check if mysql-connector is installed
    try:
        import mysql.connector
    except ImportError:
        logger.error("✗ mysql-connector-python not installed")
        logger.error("   Install with: pip install mysql-connector-python")
        return False
    
    # Step 1: Create database and user
    if not create_database():
        logger.warning("⚠ Database creation failed (may already exist)")
    
    # Step 2: Create schema
    if not create_schema():
        logger.error("✗ Schema creation failed")
        return False
    
    # Step 3: Load seed data
    if not load_seed_into_mysql():
        logger.warning("⚠ Seed data loading failed or no data available")
    
    # Step 4: Verify connection
    if not verify_mysql_connection():
        logger.error("✗ Final verification failed")
        return False
    
    logger.info("")
    logger.info("✅ Database initialization complete!")
    logger.info("   You can now start the application with: python3 app_mysql.py")
    
    return True


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
