"""
Database Configuration and Connection Manager
Handles MySQL database operations for APS system
"""

import os
import json
from typing import List, Dict, Optional
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration from environment variables
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'aps_user'),
    'password': os.getenv('DB_PASSWORD', 'APS@Secure2026#Ls!'),
    'database': os.getenv('DB_NAME', 'aps_system'),
    'port': int(os.getenv('DB_PORT', 3306))
}


class DatabaseManager:
    """Manage database connections and operations"""
    
    def __init__(self, config: Dict = None):
        """Initialize database manager"""
        self.config = config or DB_CONFIG
        self.connection = None
        self.cursor = None
    
    def connect(self):
        """Establish database connection - REQUIRED for production"""
        try:
            import mysql.connector
            self.connection = mysql.connector.connect(**self.config)
            self.cursor = self.connection.cursor(dictionary=True)
            logger.info("✓ Database connected successfully")
            return True
        except Exception as e:
            logger.debug(f"TCP connection failed: {e}")
            
            # Try with socket authentication
            try:
                logger.info("Trying socket authentication...")
                config_socket = {
                    'user': self.config.get('user', 'root'),
                    'database': self.config.get('database', 'aps_system'),
                    'unix_socket': '/var/run/mysqld/mysqld.sock'
                }
                self.connection = mysql.connector.connect(**config_socket)
                self.cursor = self.connection.cursor(dictionary=True)
                logger.info("✓ Database connected successfully (socket auth)")
                return True
            except Exception as e2:
                logger.debug(f"Socket auth also failed: {e2}")
            
            error_msg = f"""
╔════════════════════════════════════════════════════════════╗
║ MYSQL DATABASE CONNECTION FAILED                           ║
╚════════════════════════════════════════════════════════════╝

Error: {str(e)}

🔧 TO FIX:
   1. Ensure MySQL is running
   2. Check database exists: aps_system  
   3. Verify user exists and has privileges
   4. Check .env file for credentials
   5. Try running: sudo service mysql restart

📖 For detailed setup: See MYSQL_SETUP.md
"""
            logger.error(error_msg)
            raise RuntimeError(f"MySQL connection failed: {e}")

    def ensure_connected(self):
        """Reconnect if connection is lost or stale - REQUIRED"""
        try:
            import mysql.connector
            if self.connection is None or not self.connection.is_connected():
                logger.info("Reconnecting to database...")
                self.connection = mysql.connector.connect(**self.config)
                self.cursor = self.connection.cursor(dictionary=True)
        except Exception as e:
            logger.error(f"✗ Database reconnection failed: {e}")
            logger.error(f"✗ MySQL is REQUIRED for this application")
            raise RuntimeError(f"Cannot connect to MySQL database: {e}")

    def disconnect(self):
        """Close database connection"""
        try:
            if self.cursor:
                self.cursor.close()
            if self.connection:
                self.connection.close()
            logger.info("Database disconnected")
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")
    
    def execute_query(self, query: str, params: tuple = None, fetch: bool = False):
        """Execute a database query with auto-reconnect"""
        try:
            self.ensure_connected()
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
            
            if fetch:
                return self.cursor.fetchall()
            else:
                self.connection.commit()
                return self.cursor.rowcount
        except Exception as e:
            logger.error(f"Query execution error: {e}")
            try:
                self.connection.rollback()
            except Exception:
                pass
            return None
    
    # University operations
    def add_university(self, university_data: Dict) -> int:
        """Add a new university"""
        query = """
        INSERT INTO universities 
        (name, country, city, icon, website, email, phone, description, prospectus_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            university_data.get('name'),
            university_data.get('country', 'Lesotho'),
            university_data.get('city'),
            university_data.get('icon'),
            university_data.get('website'),
            university_data.get('email'),
            university_data.get('phone'),
            university_data.get('description'),
            university_data.get('prospectus_url')
        )
        result = self.execute_query(query, params)
        return result if result > 0 else 0
    
    def get_universities(self, search: str = None, country: str = None) -> List[Dict]:
        """Get universities with optional filtering, falls back to seed data"""
        try:
            if not self.connection or not self.connection.is_connected():
                data = self.get_fallback_universities()
            else:
                query = "SELECT * FROM universities WHERE 1=1"
                params = []

                if search:
                    query += " AND (name LIKE %s OR description LIKE %s)"
                    search_term = f"%{search}%"
                    params.extend([search_term, search_term])

                if country:
                    query += " AND country = %s"
                    params.append(country)

                query += " ORDER BY name"
                data = self.execute_query(query, tuple(params) if params else None, fetch=True) or []
                if not data:
                    data = self.get_fallback_universities()
        except Exception as e:
            logger.warning(f"Failed to fetch universities from DB, using fallback: {e}")
            data = self.get_fallback_universities()

        # Apply filters when using fallback
        if search:
            sl = search.lower()
            data = [u for u in data if sl in u.get('name', '').lower() or sl in u.get('description', '').lower()]
        if country:
            data = [u for u in data if u.get('country') == country]

        return data
    
    def get_university_by_id(self, uni_id: int) -> Optional[Dict]:
        """Get university by ID"""
        try:
            if not self.connection or not self.connection.is_connected():
                data = self.get_fallback_universities()
                return next((u for u in data if u['id'] == uni_id), None)
            
            query = "SELECT * FROM universities WHERE id = %s"
            result = self.execute_query(query, (uni_id,), fetch=True)
            if result:
                return result[0]
            
            # Fallback if not found
            data = self.get_fallback_universities()
            return next((u for u in data if u['id'] == uni_id), None)
        except Exception as e:
            logger.warning(f"Error fetching university {uni_id}, using fallback: {e}")
            data = self.get_fallback_universities()
            return next((u for u in data if u['id'] == uni_id), None)
    
    # Program operations
    def add_program(self, program_data: Dict, university_id: int) -> int:
        """Add a new program"""
        query = """
        INSERT INTO programs
        (university_id, faculty_id, name, field_of_study, qualification_type, 
         duration_years, description, entry_requirements, compulsory_subjects, 
         subject_requirements, minimum_score, admission_email, application_deadline, programme_code)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Convert lists/dicts to JSON strings
        compulsory = json.dumps(program_data.get('compulsory_subjects', []))
        subject_reqs = json.dumps(program_data.get('subject_requirements', {}))
        
        params = (
            university_id,
            program_data.get('faculty_id'),
            program_data.get('name'),
            program_data.get('field_of_study'),
            program_data.get('qualification_type'),
            program_data.get('duration_years', 3),
            program_data.get('description'),
            program_data.get('entry_requirements'),
            compulsory,
            subject_reqs,
            program_data.get('minimum_score', 10),
            program_data.get('admission_email'),
            program_data.get('application_deadline'),
            program_data.get('programme_code')
        )
        
        result = self.execute_query(query, params)
        return result if result > 0 else 0
    
    def get_programs(self, field: str = None, qualification: str = None, 
                    university_id: int = None) -> List[Dict]:
        """Get programs with optional filtering"""
        try:
            if not self.connection or not self.connection.is_connected():
                logger.warning("Database not available, using fallback data")
                data = self.get_fallback_programs()
            else:
                query = "SELECT * FROM programs WHERE 1=1"
                params = []
                
                if field:
                    query += " AND field_of_study = %s"
                    params.append(field)
                
                if qualification:
                    query += " AND qualification_type = %s"
                    params.append(qualification)
                
                if university_id:
                    query += " AND university_id = %s"
                    params.append(university_id)
                
                query += " ORDER BY university_id, name"
                data = self.execute_query(query, tuple(params) if params else None, fetch=True) or []
                if not data:
                    return self.get_fallback_programs()
        except Exception as e:
            logger.warning(f"Error fetching programs, using fallback: {e}")
            data = self.get_fallback_programs()
        
        # Apply filter logic if using fallback
        if field:
            data = [p for p in data if p.get('field_of_study') == field]
        if qualification:
            data = [p for p in data if p.get('qualification_type') == qualification]
        if university_id:
            data = [p for p in data if p.get('university_id') == university_id]
        
        return data
    
    def get_program_by_id(self, program_id: int) -> Optional[Dict]:
        """Get program by ID"""
        try:
            if not self.connection or not self.connection.is_connected():
                data = self.get_fallback_programs()
                return next((p for p in data if p['id'] == program_id), None)
            
            query = "SELECT * FROM programs WHERE id = %s"
            result = self.execute_query(query, (program_id,), fetch=True)
            if result:
                return result[0]
            
            # Fallback if not found
            data = self.get_fallback_programs()
            return next((p for p in data if p['id'] == program_id), None)
        except Exception as e:
            logger.warning(f"Error fetching program {program_id}, using fallback: {e}")
            data = self.get_fallback_programs()
            return next((p for p in data if p['id'] == program_id), None)
    
    # Fields and Qualifications
    def get_fields_of_study(self) -> List[str]:
        """Get all fields of study"""
        query = "SELECT field_name FROM fields_of_study ORDER BY field_name"
        results = self.execute_query(query, fetch=True)
        return [r['field_name'] for r in results] if results else []
    
    def get_qualification_types(self) -> List[str]:
        """Get all qualification types"""
        query = "SELECT qualification_name FROM qualification_types ORDER BY qualification_name"
        results = self.execute_query(query, fetch=True)
        return [r['qualification_name'] for r in results] if results else []
    
    # Eligibility check
    def check_eligibility(self, subjects: List[Dict]) -> Dict:
        """Check eligibility for all programs"""
        # Grade points mapping (A* = 5, A = 4, B = 3, C = 2, D = 1, E = 0)
        grade_points = {'A*': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0}

        # Calculate total score
        total_score = sum(grade_points.get(s['grade'].upper(), 0) for s in subjects)
        
        # Get all programs
        programs = self.get_programs()
        
        eligible_programs = []
        borderline_programs = []
        not_eligible_programs = []
        
        for program in programs:
            try:
                # Parse JSON fields (handle both string and already-parsed objects)
                cs_raw = program.get('compulsory_subjects', '[]')
                compulsory_subjects = cs_raw if isinstance(cs_raw, list) else json.loads(cs_raw or '[]')
                sr_raw = program.get('subject_requirements', '{}')
                subject_requirements = sr_raw if isinstance(sr_raw, dict) else json.loads(sr_raw or '{}')
                min_score = program.get('minimum_score', 10)
                
                # Check compulsory subjects
                subject_names = [s['subject'] for s in subjects]
                has_compulsory = all(subj in subject_names for subj in compulsory_subjects)
                
                # Check subject requirements
                meets_requirements = True
                for subject, req_grade in subject_requirements.items():
                    for subj_data in subjects:
                        if subj_data['subject'] == subject:
                            if grade_points.get(subj_data['grade'].upper(), 0) < grade_points.get(req_grade, 0):
                                meets_requirements = False
                            break
                
                # Categorize
                if has_compulsory and meets_requirements and total_score >= min_score:
                    eligible_programs.append(program)
                elif has_compulsory and total_score >= (min_score - 2):
                    borderline_programs.append(program)
                else:
                    not_eligible_programs.append(program)
            
            except Exception as e:
                logger.warning(f"Error processing program {program.get('id')}: {e}")
                not_eligible_programs.append(program)
        
        # Log the check
        self.log_eligibility_check(subjects, total_score, len(eligible_programs), 
                                  len(borderline_programs), len(not_eligible_programs))
        
        return {
            'eligible': eligible_programs,
            'borderline': borderline_programs,
            'not_eligible': not_eligible_programs,
            'summary': {
                'total_checked': len(programs),
                'eligible_count': len(eligible_programs),
                'borderline_count': len(borderline_programs),
                'not_eligible_count': len(not_eligible_programs),
                'total_score': total_score
            }
        }
    
    def log_eligibility_check(self, subjects: List[Dict], total_score: int, 
                             eligible_count: int, borderline_count: int, not_eligible_count: int):
        """Log eligibility check for analytics"""
        query = """
        INSERT INTO eligibility_checks
        (subjects_submitted, total_score, eligible_programs_count, 
         borderline_programs_count, not_eligible_programs_count)
        VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            json.dumps(subjects),
            total_score,
            eligible_count,
            borderline_count,
            not_eligible_count
        )
        self.execute_query(query, params)
    
    # Data source tracking
    def add_data_source(self, source_data: Dict) -> int:
        """Track data extraction source"""
        query = """
        INSERT INTO data_sources
        (program_id, university_id, source_type, source_url, source_file, extraction_date, data_quality_score, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            source_data.get('program_id'),
            source_data.get('university_id'),
            source_data.get('source_type'),
            source_data.get('source_url'),
            source_data.get('source_file'),
            source_data.get('extraction_date', datetime.now().date()),
            source_data.get('data_quality_score', 75),
            source_data.get('notes')
        )
        result = self.execute_query(query, params)
        return result if result > 0 else 0

    # Fallback sample data methods (when database unavailable)
    def get_fallback_universities(self):
        """Return universities from seed data file"""
        try:
            # Try to load from seed file
            seed_path = os.path.join(os.path.dirname(__file__), '..', 'data_seed.json')
            if os.path.exists(seed_path):
                with open(seed_path, 'r') as f:
                    data = json.load(f)
                    return data.get('universities', [])
        except Exception as e:
            logger.warning(f"Could not load seed data: {e}")
        
        # Fallback to minimal data
        return [
            {
                'id': 1,
                'name': 'National University of Lesotho',
                'country': 'Lesotho',
                'city': 'Roma',
                'description': 'The premier public university offering multiple faculties',
                'website': 'https://nul.ls/',
                'email': 'admin@nul.ls'
            },
            {
                'id': 2,
                'name': 'Lerotholi Polytechnic',
                'country': 'Lesotho',
                'city': 'Maseru',
                'description': 'Technical and vocational training institution',
                'website': 'https://www.lp.ac.ls/',
                'email': 'admissions@lp.ac.ls'
            },
            {
                'id': 3,
                'name': 'Lesotho College of Education',
                'country': 'Lesotho',
                'city': 'Maseru',
                'description': 'Leading institution for teacher education',
                'website': 'http://www.lce.ac.ls/',
                'email': 'info@lce.ac.ls'
            },
            {
                'id': 4,
                'name': 'Botho University Lesotho',
                'country': 'Lesotho',
                'city': 'Maseru',
                'description': 'Private university offering business and IT programs',
                'website': 'https://lesotho.bothouniversity.com/',
                'email': 'admissions@botho.ls'
            },
            {
                'id': 5,
                'name': 'Limkokwing University',
                'country': 'Lesotho',
                'city': 'Maseru',
                'description': 'Creative and digital media focused institution',
                'website': 'https://www.limkokwing.net/lesotho/',
                'email': 'info@limkokwing.net'
            },
            {
                'id': 6,
                'name': 'African University College',
                'country': 'Lesotho',
                'city': 'Maseru',
                'description': 'Pan-African institution promoting higher education',
                'website': 'https://www.aucc.ac.ls/',
                'email': 'admissions@auc.ac.ls'
            }
        ]

    def get_fallback_programs(self):
        """Return programs from seed data file"""
        try:
            # Try to load from seed file
            seed_path = os.path.join(os.path.dirname(__file__), '..', 'data_seed.json')
            if os.path.exists(seed_path):
                with open(seed_path, 'r') as f:
                    data = json.load(f)
                    programs = data.get('programs', [])
                    # Add university names to programs
                    universities = {u['id']: u['name'] for u in data.get('universities', [])}
                    for prog in programs:
                        prog['university'] = universities.get(prog.get('university_id'), 'National University of Lesotho')
                    return programs
        except Exception as e:
            logger.warning(f"Could not load seed data: {e}")
        
        # Fallback to minimal data
        return [
            {'id': 1, 'name': 'Bachelor of Science in Engineering', 'university_id': 1, 'university': 'National University of Lesotho', 'field_of_study': 'Engineering', 'qualification_type': 'Bachelor', 'duration_years': 4, 'minimum_score': 12},
            {'id': 2, 'name': 'Diploma in Business Administration', 'university_id': 2, 'university': 'Lerotholi Polytechnic', 'field_of_study': 'Business', 'qualification_type': 'Diploma', 'duration_years': 2, 'minimum_score': 8},
            {'id': 3, 'name': 'Bachelor of Education', 'university_id': 3, 'university': 'Lesotho College of Education', 'field_of_study': 'Education', 'qualification_type': 'Bachelor', 'duration_years': 3, 'minimum_score': 9},
            {'id': 4, 'name': 'Bachelor of Science in Medicine', 'university_id': 1, 'university': 'National University of Lesotho', 'field_of_study': 'Medicine', 'qualification_type': 'Bachelor', 'duration_years': 4, 'minimum_score': 14},
            {'id': 5, 'name': 'Diploma in Engineering', 'university_id': 2, 'university': 'Lerotholi Polytechnic', 'field_of_study': 'Engineering', 'qualification_type': 'Diploma', 'duration_years': 2, 'minimum_score': 10},
            {'id': 6, 'name': 'Bachelor of Laws', 'university_id': 1, 'university': 'National University of Lesotho', 'field_of_study': 'Law', 'qualification_type': 'Bachelor', 'duration_years': 4, 'minimum_score': 11},
            {'id': 7, 'name': 'Bachelor of Arts', 'university_id': 4, 'university': 'Botho University Lesotho', 'field_of_study': 'Humanities', 'qualification_type': 'Bachelor', 'duration_years': 3, 'minimum_score': 8},
            {'id': 8, 'name': 'Certificate in ICT Support', 'university_id': 5, 'university': 'Limkokwing University', 'field_of_study': 'Science', 'qualification_type': 'Certificate', 'duration_years': 1, 'minimum_score': 6},
            {'id': 9, 'name': 'Bachelor of Business Administration', 'university_id': 4, 'university': 'Botho University Lesotho', 'field_of_study': 'Business', 'qualification_type': 'Bachelor', 'duration_years': 3, 'minimum_score': 9},
            {'id': 10, 'name': 'Bachelor of Science', 'university_id': 1, 'university': 'National University of Lesotho', 'field_of_study': 'Science', 'qualification_type': 'Bachelor', 'duration_years': 3, 'minimum_score': 10},
        ]

def initialize_database():
    """Initialize database schema"""
    db = DatabaseManager()
    
    if db.connect():
        # Read schema file
        schema_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'schema.sql')
        
        try:
            with open(schema_path, 'r') as f:
                schema = f.read()
            
            # Execute schema creation
            for statement in schema.split(';'):
                if statement.strip():
                    db.execute_query(statement)
            
            logger.info("Database schema initialized successfully")
            db.disconnect()
            return True
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            db.disconnect()
            return False
    else:
        logger.error("Could not connect to database")
        return False


if __name__ == "__main__":
    # Initialize database
    initialize_database()
