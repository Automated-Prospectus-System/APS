"""
APS (Automatic Prospectus System) - Flask Backend with MySQL Database
Lesotho Higher Education Institution Guidance Platform
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from functools import wraps
import logging
import sys
import os
import json
import hashlib
from pathlib import Path
from datetime import datetime

# Add database module to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'Database' / 'database'))

from db_manager import DatabaseManager, DB_CONFIG

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

#Get the base directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Frontend static files directory
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), 'Frontend')

# Initialize Flask app with static file serving
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# Database manager instance
db = None


# ============================================================================
# STARTUP & SHUTDOWN
# ============================================================================

@app.before_request
def initialize_db():
    """Initialize database connection if not already attempted"""
    global db
    if db is None:
        db = DatabaseManager()
        try:
            if db.connect():
                logger.info("✓ Database connection established")
            else:
                logger.warning("MySQL unavailable — running in JSON fallback mode")
        except RuntimeError as e:
            logger.warning(f"MySQL unavailable — running in JSON fallback mode: {e}")


@app.teardown_appcontext
def shutdown_db(exception=None):
    """Close database connection"""
    global db
    if db is not None:
        db.disconnect()


# ============================================================================
# DECORATORS
# ============================================================================

def require_db(f):
    """Decorator to ensure database is connected"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if db is None or db.connection is None:
            return jsonify({'error': 'Database connection not available'}), 500
        return f(*args, **kwargs)
    return decorated_function


# ============================================================================
# USER MANAGEMENT (Load users from JSON file)
# ============================================================================

def load_users():
    """Load users from users.json file"""
    try:
        users_path = os.path.join(BASE_DIR, 'users.json')
        if os.path.exists(users_path):
            with open(users_path, 'r') as f:
                data = json.load(f)
                return {user['username']: user for user in data.get('users', [])}
    except Exception as e:
        logger.error(f"Error loading users: {e}")
    return {}


users_db = load_users()

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hash_value):
    """Verify password against hash"""
    return hash_password(password) == hash_value

def ensure_users_table():
    """Ensure users table exists"""
    try:
        if db and db.connection:
            cursor = db.connection.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                date_of_birth DATE,
                country VARCHAR(100) DEFAULT 'Lesotho',
                city VARCHAR(100),
                school_name VARCHAR(255),
                grade_level VARCHAR(50),
                subjects_taken JSON,
                role VARCHAR(50) DEFAULT 'student',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                INDEX idx_username (username),
                INDEX idx_email (email),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            db.connection.commit()
            return True
    except Exception as e:
        logger.warning(f"Could not ensure users table: {e}")
    return False

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user account"""
    try:
        data = request.get_json() or {}

        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        confirm_password = data.get('confirmPassword', '').strip()
        full_name = data.get('fullName', '').strip()

        if not all([username, email, password, confirm_password, full_name]):
            return jsonify({'error': 'All fields are required'}), 400
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400
        if '@' not in email:
            return jsonify({'error': 'Invalid email address'}), 400

        # ── MySQL path ──────────────────────────────────────────────────────────
        if db and db.connection and db.connection.is_connected():
            ensure_users_table()
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s LIMIT 1", (username, email))
            if cursor.fetchone():
                return jsonify({'error': 'Username or email already exists'}), 409

            password_hash = hash_password(password)
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, full_name, phone,
                                 date_of_birth, country, city, school_name, grade_level, role)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                username, email, password_hash, full_name,
                data.get('phone', ''), data.get('dateOfBirth'),
                data.get('country', 'Lesotho'), data.get('city', ''),
                data.get('schoolName', ''), data.get('gradeLevel', ''), 'student'
            ))
            db.connection.commit()
            user_id = cursor.lastrowid

        # ── JSON fallback path ──────────────────────────────────────────────────
        else:
            global users_db
            users_db = load_users()  # refresh from file

            if username in users_db or any(u.get('email') == email for u in users_db.values()):
                return jsonify({'error': 'Username or email already exists'}), 409

            users_path = os.path.join(BASE_DIR, 'users.json')
            try:
                with open(users_path, 'r') as f:
                    file_data = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                file_data = {'users': []}

            user_id = max((u.get('id', 0) for u in file_data.get('users', [])), default=0) + 1
            new_user = {
                'id': user_id,
                'username': username,
                'email': email,
                'name': full_name,
                'password_hash': hash_password(password),
                'role': 'student',
                'phone': data.get('phone', ''),
                'city': data.get('city', ''),
                'schoolName': data.get('schoolName', ''),
                'gradeLevel': data.get('gradeLevel', ''),
                'country': 'Lesotho'
            }
            file_data.setdefault('users', []).append(new_user)
            with open(users_path, 'w') as f:
                json.dump(file_data, f, indent=2)

            users_db = load_users()
            logger.info(f"✓ User registered to JSON file: {username}")

        logger.info(f"✓ New user registered: {username}")
        return jsonify({
            'success': True,
            'message': 'Registration successful! Please login with your credentials.',
            'user': {'id': user_id, 'username': username, 'email': email, 'fullName': full_name}
        }), 201

    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login endpoint - validate credentials from database or JSON fallback"""
    try:
        data = request.get_json() or {}
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400

        # ── MySQL path ──────────────────────────────────────────────────────────
        if db and db.connection and db.connection.is_connected():
            ensure_users_table()
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, username, email, full_name, password_hash, role, is_active
                FROM users WHERE username = %s OR email = %s LIMIT 1
            """, (username, username))
            user = cursor.fetchone()

            if user:
                if not verify_password(password, user['password_hash']):
                    return jsonify({'error': 'Invalid username or password'}), 401
                if not user['is_active']:
                    return jsonify({'error': 'Account is inactive'}), 403
                cursor.execute("UPDATE users SET last_login = NOW() WHERE id = %s", (user['id'],))
                db.connection.commit()
                logger.info(f"✓ User logged in (MySQL): {username}")
                return jsonify({
                    'success': True,
                    'user': {
                        'id': user['id'], 'username': user['username'],
                        'email': user['email'], 'fullName': user['full_name'],
                        'role': user['role']
                    }
                }), 200

        # ── JSON fallback path ──────────────────────────────────────────────────
        current_users = load_users()

        # Check by username or email
        user_data = current_users.get(username) or next(
            (u for u in current_users.values() if u.get('email') == username), None
        )

        if not user_data:
            return jsonify({'error': 'Invalid username or password'}), 401

        # Verify password — support both hashed (registered users) and plain (seed users)
        stored = user_data.get('password_hash') or user_data.get('password', '')
        if stored == hash_password(password) or stored == password:
            logger.info(f"✓ User logged in (JSON): {username}")
            return jsonify({
                'success': True,
                'user': {
                    'id': user_data.get('id', 1),
                    'username': user_data['username'],
                    'email': user_data.get('email', ''),
                    'fullName': user_data.get('name') or user_data.get('fullName', username),
                    'role': user_data.get('role', 'student')
                }
            }), 200

        return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@app.route('/api/auth/users', methods=['GET'])
def list_users():
    """List all available users (for demo purposes)"""
    try:
        users_list = [
            {
                'username': user['username'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
            for user in users_db.values()
        ]
        return jsonify({
            'success': True,
            'users': users_list,
            'note': 'Admin users - password: password123'
        }), 200
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        return jsonify({'error': str(e)}), 500



# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0',
        'database': 'mysql' if db and db.connection else 'disconnected'
    }), 200


# ============================================================================
# UNIVERSITIES ENDPOINTS
# ============================================================================

@app.route('/api/universities', methods=['GET'])
def get_universities():
    """Get all universities with optional filtering"""
    try:
        search = request.args.get('search')
        country = request.args.get('country', 'Lesotho')
        
        universities = db.get_universities(search=search, country=country)
        
        return jsonify({
            'success': True,
            'count': len(universities) if universities else 0,
            'data': universities or []
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching universities: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/universities/<int:uni_id>', methods=['GET'])
def get_university(uni_id):
    """Get single university with its programs"""
    try:
        university = db.get_university_by_id(uni_id)
        
        if not university:
            return jsonify({'error': 'University not found'}), 404
        
        # Get programs for this university
        programs = db.get_programs(university_id=uni_id)
        university['programs'] = programs
        
        return jsonify({
            'success': True,
            'data': university
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching university {uni_id}: {e}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# PROGRAMS ENDPOINTS
# ============================================================================

@app.route('/api/programs', methods=['GET'])
def get_programs():
    """Get all programs with optional filtering"""
    try:
        field = request.args.get('field')
        qualification = request.args.get('qualification')
        university_id = request.args.get('university_id', type=int)
        
        programs = db.get_programs(
            field=field,
            qualification=qualification,
            university_id=university_id
        )
        
        return jsonify({
            'success': True,
            'count': len(programs) if programs else 0,
            'data': programs or []
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching programs: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/programs/<int:program_id>', methods=['GET'])
def get_program(program_id):
    """Get single program details"""
    try:
        program = db.get_program_by_id(program_id)
        
        if not program:
            return jsonify({'error': 'Program not found'}), 404
        
        return jsonify({
            'success': True,
            'data': program
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching program {program_id}: {e}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# ELIGIBILITY CHECK ENDPOINT (Core Feature)
# ============================================================================

@app.route('/api/check-eligibility', methods=['POST'])
@app.route('/api/eligibility', methods=['POST'])
def check_eligibility():
    """
    Check program eligibility based on exam results
    
    Expected JSON payload:
    {
        "subjects": [
            {"subject": "Mathematics", "grade": "A"},
            {"subject": "English", "grade": "B"},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'subjects' not in data:
            return jsonify({'error': 'Missing subjects field'}), 400
        
        subjects = data.get('subjects', [])
        # Support both {subjects:[...]} and {total_score:N, subjects:[...]} payloads
        total_score_override = data.get('total_score')

        if not isinstance(subjects, list) or len(subjects) == 0:
            return jsonify({'error': 'At least one subject is required'}), 400
        
        # Validate subject data
        for subject in subjects:
            if 'subject' not in subject or 'grade' not in subject:
                return jsonify({'error': 'Each subject must have name and grade'}), 400

            if subject['grade'].upper() not in ['A*', 'A', 'B', 'C', 'D', 'E']:
                return jsonify({'error': f"Invalid grade: {subject['grade']}. Must be A*, A, B, C, D, or E"}), 400
        
        # Check eligibility
        results = db.check_eligibility(subjects)
        
        return jsonify({
            'success': True,
            'eligible': results['eligible'],
            'borderline': results['borderline'],
            'not_eligible': results['not_eligible'],
            'summary': results['summary']
        }), 200
    
    except Exception as e:
        logger.error(f"Error checking eligibility: {e}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# FILTER OPTIONS ENDPOINTS
# ============================================================================

@app.route('/api/fields', methods=['GET'])
def get_fields():
    """Get all available fields of study"""
    try:
        fields = db.get_fields_of_study()
        
        return jsonify({
            'success': True,
            'count': len(fields),
            'data': fields
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching fields: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/qualifications', methods=['GET'])
def get_qualifications():
    """Get all available qualification types"""
    try:
        qualifications = db.get_qualification_types()
        
        return jsonify({
            'success': True,
            'count': len(qualifications),
            'data': qualifications
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching qualifications: {e}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# SEARCH ENDPOINT
# ============================================================================

@app.route('/api/search', methods=['GET'])
def search():
    """Combined search across universities and programs"""
    try:
        query = request.args.get('q', '').strip()
        
        if len(query) < 2:
            return jsonify({'error': 'Search query too short'}), 400
        
        universities = db.get_universities(search=query)
        programs = db.get_programs()
        
        # Filter programs by name or description
        matching_programs = [
            p for p in programs
            if query.lower() in p['name'].lower() or
               (p.get('description') and query.lower() in p['description'].lower())
        ]
        
        return jsonify({
            'success': True,
            'query': query,
            'universities': universities or [],
            'programs': matching_programs or []
        }), 200
    
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# STATIC FILE SERVING (Frontend)
# ============================================================================

@app.route('/', methods=['GET'])
def index():
    """Serve login page at root"""
    return send_from_directory(FRONTEND_DIR, 'login.html')


@app.route('/login.html', methods=['GET'])
def serve_login():
    """Serve login page"""
    return send_from_directory(FRONTEND_DIR, 'login.html')


@app.route('/home.html', methods=['GET'])
def home():
    """Serve home page"""
    return send_from_directory(FRONTEND_DIR, 'home.html')


@app.route('/programs.html', methods=['GET'])
def programs():
    """Serve programs page"""
    return send_from_directory(FRONTEND_DIR, 'programs.html')


@app.route('/universities.html', methods=['GET'])
def universities():
    """Serve universities page"""
    return send_from_directory(FRONTEND_DIR, 'universities.html')


@app.route('/register.html', methods=['GET'])
def serve_register():
    """Serve register page"""
    return send_from_directory(FRONTEND_DIR, 'register.html')


@app.route('/<path:filename>', methods=['GET'])
def serve_static(filename):
    """Serve static files (CSS, JS, etc)"""
    try:
        return send_from_directory(FRONTEND_DIR, filename)
    except Exception as e:
        logger.error(f"Error serving file {filename}: {e}")
        return jsonify({'error': 'File not found'}), 404


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# STARTUP
# ============================================================================

def print_startup_banner():
    """Print startup information"""
    banner = """
    
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🎓 APS - Automatic Prospectus System v2.0            ║
    ║   Lesotho Higher Education Guidance Platform            ║
    ║                                                           ║
    ║   Backend: Flask + MySQL Database                       ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    
    Database Configuration:
      Host: {host}
      Database: {database}
      Port: {port}
    
    API Endpoints:
      GET    /api/health                    - Health check
      GET    /api/universities              - List universities
      GET    /api/universities/<id>         - University details
      GET    /api/programs                  - List programs
      GET    /api/programs/<id>             - Program details
      POST   /api/eligibility               - Check eligibility
      GET    /api/fields                    - Get fields of study
      GET    /api/qualifications            - Get qualification types
      GET    /api/search?q=query            - Search
    
    Compiling system...
    """.format(
        host=DB_CONFIG['host'],
        database=DB_CONFIG['database'],
        port=DB_CONFIG['port']
    )
    print(banner)


if __name__ == '__main__':
    print_startup_banner()
    
    logger.info("Starting APS Backend...")
    logger.info(f"Database: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    
    try:
        app.run(
            host='127.0.0.1',
            port=5000,
            debug=True,
            use_reloader=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)
