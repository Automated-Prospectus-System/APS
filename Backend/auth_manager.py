"""
APS Authentication Module
Handles user authentication, JWT tokens, and session management
"""

import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
import hashlib
import secrets

# Secret key for JWT
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'aps_secure_key_change_in_production_2026')

# Default admin credentials (should be changed in production)
DEFAULT_ADMIN = {
    'username': 'admin',
    'password': 'admin123',
    'email': 'admin@aps.ls',
    'role': 'superadmin'
}

class AuthManager:
    """Manage authentication and tokens"""
    
    def __init__(self):
        self.users = {
            'admin': self._hash_password('admin123'),
        }
        self.user_details = {
            'admin': {
                'email': 'admin@aps.ls',
                'role': 'superadmin',
                'full_name': 'System Administrator'
            }
        }
    
    @staticmethod
    def _hash_password(password):
        """Hash password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(self, username, password):
        """Verify username and password"""
        if username not in self.users:
            return False
        return self.users[username] == self._hash_password(password)
    
    def create_token(self, username, duration_hours=24):
        """Create JWT token"""
        payload = {
            'username': username,
            'role': self.user_details[username]['role'],
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=duration_hours)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return token
    
    def verify_token(self, token):
        """Verify JWT token and extract payload"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None  # Token expired
        except jwt.InvalidTokenError:
            return None  # Invalid token
    
    def get_user_details(self, username):
        """Get user details"""
        return self.user_details.get(username)
    
    def add_user(self, username, password, email, role='user'):
        """Add new user (for admin dashboard)"""
        if username in self.users:
            return False  # User exists
        self.users[username] = self._hash_password(password)
        self.user_details[username] = {
            'email': email,
            'role': role,
            'full_name': username.title()
        }
        return True
    
    def change_password(self, username, old_password, new_password):
        """Change user password"""
        if not self.verify_password(username, old_password):
            return False
        self.users[username] = self._hash_password(new_password)
        return True


# Initialize auth manager
auth_manager = AuthManager()


def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # "Bearer <token>"
            except IndexError:
                return jsonify({'error': 'Invalid authorization header'}), 401
        
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        
        payload = auth_manager.verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Store payload in request context
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated


def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user.get('role') not in ['superadmin', 'admin']:
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    
    return decorated
