"""
APS (Automatic Prospectus System) - Flask Backend with MySQL Database (Fallback Mode)
Lesotho Higher Education Institution Guidance Platform
This version works even if MySQL is not available (development/testing mode)
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from functools import wraps
import logging
import sys
import os
import json
import hashlib
from datetime import datetime
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get the base directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Frontend static files directory
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), 'Frontend')

# Initialize Flask app with static file serving
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# Database manager instance (optional)
db = None
db_available = False

# ============================================================================
# STARTUP & SHUTDOWN
# ============================================================================

@app.before_request
def initialize_db():
    """Initialize or reconnect database connection"""
    global db, db_available
    try:
        if db is None:
            sys.path.insert(0, str(Path(BASE_DIR).parent / 'Database' / 'database'))
            from db_manager import DatabaseManager
            db = DatabaseManager()
            db.connect()
            logger.info("✓ Database connection established")
            db_available = True
        else:
            # Ping to detect and recover from stale connections
            try:
                db.connection.ping(reconnect=True, attempts=3, delay=1)
                db_available = True
            except Exception:
                db.ensure_connected()
                db_available = True
    except Exception as e:
        if not db_available:
            logger.warning(f"⚠ Database not available ({e}) - using fallback mode")
        db_available = False


# ============================================================================
# DECORATORS
# ============================================================================

def require_db(f):
    """Decorator to ensure database is connected"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not db_available or db is None or db.connection is None:
            return jsonify({'error': 'Database connection not available', 'fallback': True}), 503
        return f(*args, **kwargs)
    return decorated_function


# ============================================================================
# USER MANAGEMENT (Load users from JSON file)
# ============================================================================

def load_users():
    """Load users from users.json file"""
    try:
        users_path = os.path.join(BASE_DIR, '..', 'Database', 'users.json')
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

def load_seed_data():
    """Load seed data from data_seed.json"""
    try:
        seed_path = os.path.join(BASE_DIR, '..', 'Database', 'data_seed.json')
        with open(seed_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.warning(f"Could not load seed data: {e}")
        return {"universities": [], "programs": []}

# Load seed data once
seed_data = load_seed_data()

# ============================================================================
# ROOT & STATIC ROUTES
# ============================================================================

@app.route('/')
def serve_home():
    """Serve home page"""
    return send_from_directory(FRONTEND_DIR, 'home.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    # Try to serve as HTML for SPA 
    if os.path.exists(os.path.join(FRONTEND_DIR, path + '.html')):
        return send_from_directory(FRONTEND_DIR, path + '.html')
    return "Not Found", 404

# ============================================================================
# API - UNIVERSITIES
# ============================================================================

def query_db(sql, params=None, fetchone=False):
    """Execute a query with auto-reconnect, returns list/dict or None on failure"""
    global db, db_available
    try:
        db.connection.ping(reconnect=True, attempts=3, delay=1)
        cursor = db.connection.cursor(dictionary=True)
        cursor.execute(sql, params or ())
        result = cursor.fetchone() if fetchone else cursor.fetchall()
        cursor.close()
        return result
    except Exception as e:
        logger.error(f"DB query error: {e}")
        try:
            db.ensure_connected()
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute(sql, params or ())
            result = cursor.fetchone() if fetchone else cursor.fetchall()
            cursor.close()
            return result
        except Exception as e2:
            logger.error(f"DB retry failed: {e2}")
            db_available = False
            return None


@app.route('/api/universities', methods=['GET'])
def get_universities():
    """Get all universities"""
    if db_available and db:
        result = query_db("SELECT * FROM universities ORDER BY name")
        if result is not None:
            return jsonify(result)
    return jsonify(seed_data.get('universities', []))

@app.route('/api/universities/<int:uni_id>', methods=['GET'])
def get_university(uni_id):
    """Get specific university"""
    if db_available and db:
        result = query_db("SELECT * FROM universities WHERE id = %s", (uni_id,), fetchone=True)
        if result:
            return jsonify(result)
    for uni in seed_data.get('universities', []):
        if uni.get('id') == uni_id:
            return jsonify(uni)
    return jsonify({'error': 'University not found'}), 404

# ============================================================================
# API - PROGRAMS
# ============================================================================

@app.route('/api/programs', methods=['GET'])
def get_programs():
    """Get all programs with optional filtering"""
    if db_available and db:
        result = query_db("""
            SELECT p.*, u.name AS university
            FROM programs p
            LEFT JOIN universities u ON p.university_id = u.id
            ORDER BY p.name
        """)
        if result is not None:
            return jsonify(result)
    return jsonify(seed_data.get('programs', []))

@app.route('/api/programs/<int:prog_id>', methods=['GET'])
def get_program(prog_id):
    """Get specific program"""
    if db_available and db:
        result = query_db("""
            SELECT p.*, u.name AS university
            FROM programs p
            LEFT JOIN universities u ON p.university_id = u.id
            WHERE p.id = %s
        """, (prog_id,), fetchone=True)
        if result:
            return jsonify(result)
    for prog in seed_data.get('programs', []):
        if prog.get('id') == prog_id:
            return jsonify(prog)
    return jsonify({'error': 'Program not found'}), 404

# ============================================================================
# API - SEARCH
# ============================================================================

@app.route('/api/search', methods=['GET'])
def search():
    """Search programs and universities"""
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify({'error': 'No search query provided'}), 400
    
    try:
        results = {'programs': [], 'universities': []}
        
        # Search in seed data
        for program in seed_data.get('programs', []):
            if query in program.get('name', '').lower() or query in program.get('field', '').lower():
                results['programs'].append(program)
        
        for uni in seed_data.get('universities', []):
            if query in uni.get('name', '').lower() or query in uni.get('location', '').lower():
                results['universities'].append(uni)
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# API - AUTHENTICATION
# ============================================================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json() or {}
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        # Check in users database
        user = users_db.get(username)
        if user and verify_password(password, user.get('password_hash', '')):
            return jsonify({
                'success': True,
                'username': user['username'],
                'email': user.get('email'),
                'fullName': user.get('name')
            })
        
        return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user"""
    global users_db
    try:
        data = request.get_json() or {}
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        full_name = data.get('fullName', '').strip()

        if not username or not password or not email:
            return jsonify({'error': 'Username, email, and password are required'}), 400

        if username in users_db:
            return jsonify({'error': 'Username already exists'}), 400

        # Check for duplicate email
        for u in users_db.values():
            if u.get('email', '').lower() == email.lower():
                return jsonify({'error': 'Email already registered'}), 400

        # Load and update users.json
        users_path = os.path.join(BASE_DIR, '..', 'Database', 'users.json')
        with open(users_path, 'r') as f:
            file_data = json.load(f)

        existing_ids = [u.get('id', 0) for u in file_data.get('users', [])]
        new_id = max(existing_ids, default=0) + 1

        new_user = {
            'id': new_id,
            'username': username,
            'email': email,
            'password_hash': hash_password(password),
            'name': full_name or username,
            'role': 'student',
            'created_at': datetime.now().isoformat() + 'Z'
        }

        file_data['users'].append(new_user)

        with open(users_path, 'w') as f:
            json.dump(file_data, f, indent=2)

        # Reload in-memory db
        users_db = load_users()

        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'username': username
        })
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

# ============================================================================
# API - ELIGIBILITY CHECK
# ============================================================================

@app.route('/api/check-eligibility', methods=['POST'])
def check_eligibility():
    """Check student eligibility for programs based on APS score"""
    try:
        data = request.get_json() or {}
        total_score = data.get('total_score', 0)
        subjects = data.get('subjects', [])

        eligible = []
        if db_available and db:
            rows = query_db("""
                SELECT p.*, u.name AS university
                FROM programs p JOIN universities u ON p.university_id = u.id
                WHERE p.minimum_score <= %s
                ORDER BY u.name, p.name
            """, (total_score,))
            if rows is not None:
                eligible = rows

        return jsonify({
            'eligible': eligible,
            'total_score': total_score,
            'max_score': 24
        })
    except Exception as e:
        logger.error(f"Eligibility check error: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'database': 'available' if db_available else 'unavailable (fallback mode)',
        'timestamp': datetime.now().isoformat()
    })

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("🎓 APS - Automatic Prospectus System")
    logger.info("Backend API Server (Fallback Mode)")
    logger.info("=" * 60)
    logger.info(f"📁 Frontend directory: {FRONTEND_DIR}")
    logger.info(f"📊 Loaded seed data: {len(seed_data.get('universities', []))} universities, {len(seed_data.get('programs', []))} programs")
    logger.info("")
    logger.info("🚀 Starting server on http://localhost:5000")
    logger.info("Press Ctrl+C to stop")
    logger.info("=" * 60)
    
    port = int(os.environ.get('APS_TEST_PORT', 5000))
    threaded = os.environ.get('APS_TEST_PORT') is None  # single-threaded during tests
    app.run(host='0.0.0.0', port=port, debug=False, threaded=threaded)
