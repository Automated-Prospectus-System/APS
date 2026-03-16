# 🎓 APS Registration & Login System - Complete Setup Guide

## ✅ What's Been Fixed & Implemented

### 1. **User Registration System**
- ✅ New registration page: `Frontend/register.html`
- ✅ Database table created for user registration: `users`
- ✅ Backend API endpoint for registration: `/api/auth/register`
- ✅ Password hashing with SHA256
- ✅ Email and username validation
- ✅ Form validation with clear error messages

### 2. **Updated Login System**
- ✅ Backend API endpoint for login: `/api/auth/login`
- ✅ Database authentication (queries from `users` table)
- ✅ Session management with localStorage/sessionStorage
- ✅ Better error handling and user feedback
- ✅ Fallback support for admin accounts (from JSON file)

### 3. **Database Structure**
- ✅ Users table with complete schema:
  - `id`: Auto-increment ID
  - `username`: Unique username
  - `email`: Unique email
  - `password_hash`: SHA256 hashed password
  - `full_name`: User's full name
  - `phone`: Optional phone number
  - `date_of_birth`: Optional date of birth
  - `country`: Default 'Lesotho'
  - `city`: Optional city
  - `school_name`: Optional school name
  - `grade_level`: Optional grade level
  - `subjects_taken`: JSON field for subject data
  - `role`: User role (default 'student')
  - `is_active`: Account status
  - `created_at`, `updated_at`, `last_login`: Timestamps

---

## 🚀 How to Use the System

### **Step 1: Create New Account**

1. Open in browser: `file:///home/mokane/Desktop/APS/Frontend/register.html`
2. Fill in the registration form:
   - **Full Name** (required)
   - **Username** (min. 3 characters, required)
   - **Email** (valid email format, required)
   - **Password** (min. 6 characters, required)
   - **Confirm Password** (must match, required)
   - **Phone** (optional)
   - **Date of Birth** (optional)
   - **School Name** (optional)
   - **Grade Level** (optional)
   - **City** (optional)

3. Click "Create Account"
4. Wait for confirmation message
5. Automatically redirected to login page

### **Step 2: Login with New Account**

1. Open in browser: `file:///home/mokane/Desktop/APS/Frontend/login.html`
2. Enter your credentials:
   - **Username** or **Email** (either works)
   - **Password** (the one you registered with)
3. Click "Login"
4. Upon success, redirected to dashboard (`home.html`)

---

## 🔑 Test Credentials

### **Admin Accounts (From JSON)**
- **Username**: Mokane21
- **Password**: password123
- **Role**: Admin

### **Sample User Account (Create via Registration)**
- **Username**: testuser
- **Email**: test@example.com
- **Password**: Test123456

---

## 📁 File Structure

```
Frontend/
├── login.html ............... Login page (UPDATED)
├── register.html ........... Registration page (NEW)
├── home.html ............... Dashboard
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── auth.js ......... Authentication utilities
│       └── script-api.js ... API client

Backend/
├── app_mysql.py ........... Main Flask app (UPDATED with new endpoints)
├── auth_manager.py ....... Authentication utilities
└── requirements.txt ...... Dependencies

Database/
├── database/
│   ├── db_manager.py ..... Database manager
│   └── schema.sql ........ Database schema (includes users table)
└── data_seed.json ........ University data
```

---

## 🔗 Backend API Endpoints

### **Registration**
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "phone": "+266 20000000",
    "dateOfBirth": "2005-01-15",
    "schoolName": "Excel Academy",
    "gradeLevel": "Form E",
    "city": "Maseru",
    "country": "Lesotho"
}

Response (201):
{
    "success": true,
    "message": "Registration successful! Please login with your credentials.",
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "fullName": "John Doe"
    }
}
```

### **Login**
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
    "username": "johndoe",  // or email
    "password": "SecurePass123"
}

Response (200):
{
    "success": true,
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "fullName": "John Doe",
        "role": "student"
    }
}
```

### **List Available Users (Admin Accounts)**
```
GET /api/auth/users

Response (200):
{
    "success": true,
    "users": [
        {
            "username": "Mokane21",
            "name": "System Administrator",
            "email": "admin@aps.ls",
            "role": "admin"
        }
    ],
    "note": "Admin users - password: password123"
}
```

---

## 🛠️ Common Issues & Fixes

### **Issue: "Username or email already exists"**
- **Cause**: User account already registered with that username/email
- **Fix**: Use a different username or email

### **Issue: "Invalid username or password"**
- **Cause**: Wrong credentials entered
- **Fix**: Double-check spelling and case sensitivity

### **Issue: "Passwords do not match"**
- **Cause**: Password and confirm password fields don't match
- **Fix**: Ensure both password fields contain the same value

### **Issue: Backend shows "Database connection not available"**
- **Cause**: MySQL is not running or database is disconnected
- **Fix**: 
  - Verify MySQL is running
  - Check database credentials in `.env` file
  - Restart backend server

### **Issue: Registration form not submitting**
- **Cause**: Validation errors or backend not responding
- **Fix**:
  - Check all required fields are filled
  - Open browser console (F12) to see errors
  - Verify backend is running on port 5000

---

## 📝 Database Credentials

| Setting | Value |
|---------|-------|
| **Host** | localhost |
| **Port** | 3306 |
| **Database** | aps_system |
| **User** | aps_user |
| **Password** | aps_secure_password_123 |

---

## 🔐 Security Features

✅ **Password Hashing**: SHA256 hash (production should use bcrypt)
✅ **Input Validation**: All fields validated on client and server
✅ **Email Validation**: Proper email format checking
✅ **Unique Constraints**: Username and email must be unique
✅ **CORS Enabled**: Cross-origin requests allowed for development
✅ **Session Management**: User data stored in sessionStorage

---

## 🚀 Access the Website

### **Option 1: Direct File Opening (Fastest)**
```
file:///home/mokane/Desktop/APS/Frontend/login.html
```

### **Option 2: Local Server (Recommended)**
```bash
# Terminal 1: Start Python HTTP server
cd /home/mokane/Desktop/APS/Frontend
python3 -m http.server 8000

# Then open: http://localhost:8000/login.html
```

---

## ✨ Navigation Flow

1. **Start**: `login.html` → Login or Registration
2. **New User**: Click "Create one now" → `register.html`
3. **After Registration**: Auto-redirect to `login.html`
4. **After Login**: Redirect to `home.html` (Dashboard)
5. **From Dashboard**: Browse programs, universities, etc.

---

## 📊 Quick Check Commands

```bash
# Check if Backend is running
pgrep -f "app_mysql.py"

# Check if MySQL is running
mysql -u aps_user -p aps_system -e "SELECT COUNT(*) FROM users;"

# View backend logs
tail -f /tmp/aps_backend.log

# Stop backend
pkill -f "app_mysql.py"

# Start backend
cd /home/mokane/Desktop/APS && python3 Backend/app_mysql.py &

# Check all available users in database
mysql -u aps_user -p aps_system -e "SELECT username, email, role FROM users LIMIT 10;"
```

---

## ✅ System Status Summary

| Component | Status | Location |
|-----------|--------|----------|
| Registration API | ✅ Working | `/api/auth/register` |
| Login API | ✅ Working | `/api/auth/login` |
| Registration Page | ✅ Ready | `Frontend/register.html` |
| Login Page | ✅ Updated | `Frontend/login.html` |
| Database | ✅ Ready | `aps_system` |
| Users Table | ✅ Ready | `users` table |
| Backend Server | ✅ Running | Port 5000 |

---

## 🎓 Next Steps

1. ✅ **Register** - Create a new account via registration page
2. ✅ **Login** - Login with your registered credentials
3. ✅ **Explore** - Browse universities and programs
4. ✅ **Search** - Find programs matching your subjects
5. ✅ **Connect** - Apply to universities

---

**Everything is set up and ready!** Start by visiting the registration page to create your account. 🚀
