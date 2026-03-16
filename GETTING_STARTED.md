# 🚀 APS - Getting Started Guide

## Quick Start (Just Works!)

The simplest way to run the application:

```bash
cd /home/mokane/Desktop/APS
bash START_APP.sh
```

Then open your browser and go to: **http://localhost:5000**

---

## What You Get

✅ **Full Application Running** - No complex setup required  
✅ **Works Without MySQL** - Uses fallback mode with seed data  
✅ **All Features Available** - Universities, programs, search, eligibility checking  
✅ **Modern Web Interface** - Responsive design works on all devices  

---

## Features Available

### 📚 Browse Universities
- View all 6 Lesotho universities
- Search and filter

### 🎓 Explore Programs  
- Browse 20+ academic programs
- Filter by field of study
- View requirements and details

### ✅ Eligibility Checker
- Check which programs you qualify for
- Based on your LGCSE grades
- Get matching programs

### 🔐 User Management
- Register for an account
- Login securely
- Track your preferences

---

## How It Works

### Two Modes

**Development Mode (Default)**
- No MySQL setup required
- Uses built-in data
- Perfect for testing
- Works immediately

**Production Mode (Optional)**
- Full MySQL database
- Persistent data storage
- For deployment
- Requires MySQL installation

### Automatic Mode Selection

The app automatically detects which mode to use:

```
✅ MySQL found AND running  → Production Mode
❌ MySQL not available      → Development Mode (fallback)
```

---

## Troubleshooting

### Port 5000 Already in Use

If you see: `Address already in use`

**Solution 1**: Stop the existing process
```bash
fuser -k 5000/tcp
```

**Solution 2**: Use a different port
- Edit `Backend/app_dev.py`
- Change `port=5000` to `port=5001` (or any other port)
- Run again

### Can't Access http://localhost:5000

1. Check the server is running (look for "Starting server" message)
2. Try `http://127.0.0.1:5000` instead
3. Check Firefox or Chrome are open and active
4. Wait 2-3 seconds after seeing "Starting server"

### API Errors (503 Database Connection)

- This is expected in development mode
- The app works using fallback data
- Use Production Mode for full database features

---

## Advanced: Production Setup (With MySQL)

If you want to use the full MySQL database system:

### 1. Install MySQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install mysql-server mysql-client
sudo service mysql start
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

### 2. Set Root Password (if needed)

```bash
sudo mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';
EXIT;
```

### 3. Configure Database

Edit `/home/mokane/Desktop/APS/.env`:
```
DB_HOST=localhost
DB_USER=aps_user
DB_PASSWORD=aps_secure_password_123
DB_NAME=aps_system
DB_PORT=3306
DB_ROOT_USER=root
DB_ROOT_PASSWORD=your_mysql_root_password
```

### 4. Initialize Database

```bash
cd /home/mokane/Desktop/APS
./venv/bin/python Database/database/init_mysql.py
```

Expected output:
```
✓ Database 'aps_system' created/exists
✓ User 'aps_user' created/exists with privileges granted
✓ Database schema created/verified
✓ Loaded 6 universities
✓ Loaded 20 programs
✅ Database initialization complete!
```

### 5. Start with MySQL Backend

```bash
cd Backend
../venv/bin/python app_mysql.py
```

---

## Project Structure

```
APS/
├── START_APP.sh                  # ← Run this to start!
├── Backend/
│   ├── app_dev.py               # Development mode (no MySQL needed)
│   ├── app_mysql.py             # Production mode (with MySQL)
│   └── requirements.txt          # Python dependencies
├── Frontend/
│   ├── home.html                # Home page
│   ├── programs.html            # Programs page
│   ├── universities.html        # Universities page
│   └── assets/
│       ├── css/style.css        # Styling
│       └── js/                  # JavaScript files
├── Database/
│   ├── database/                # Database configuration
│   ├── data_seed.json           # Seed data
│   └── users.json               # User accounts
└── docs/                         # Documentation
```

---

## File Descriptions

### Frontend
- **home.html** - Landing page with institution overview
- **programs.html** - Program search and exploration
- **universities.html** - University directory
- **login.html** - User authentication
- **register.html** - New account registration

### Backend  
- **app_dev.py** - Development server (fallback mode, no MySQL)
- **app_mysql.py** - Production server (full MySQL database)
- **requirements.txt** - All Python dependencies

### Database
- **data_seed.json** - 6 universities + 20 programs (pre-loaded data)
- **users.json** - Sample user accounts for testing
- **init_mysql.py** - Automatic database setup script

---

## API Endpoints

The backend provides REST APIs:

### Universities
- `GET /api/universities` - List all universities
- `GET /api/universities/<id>` - Get specific university

### Programs
- `GET /api/programs` - List all programs
- `GET /api/programs/<id>` - Get specific program

### Search
- `GET /api/search?q=query` - Search universities and programs

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register ` - Register new user

### Eligibility
- `POST /api/check-eligibility` - Check program eligibility

### Health
- `GET /api/health` - Server status check

---

## For Developers

### Install Dependencies

```bash
cd /home/mokane/Desktop/APS
./venv/bin/pip install -r Backend/requirements.txt
```

### Run Development Server

```bash
cd Backend
../venv/bin/python app_dev.py
```

### Run Production Server (with MySQL)

```bash
cd Backend
../venv/bin/python app_mysql.py
```

### Check Python Version

```bash
./venv/bin/python --version
```

---

## Support

For issues or questions:

1. Check `docs/TROUBLESHOOTING.md` for common problems
2. Review `docs/MYSQL_SETUP.md` for database issues  
3. Check `docs/STARTUP_GUIDE.md` for startup problems

---

## ✨ Success!

You should now see:
```
============================================================
🎓 APS - Automatic Prospectus System
Backend API Server
============================================================
📁 Frontend directory: /home/mokane/Desktop/APS/Frontend
📊 Loaded seed data: 6 universities, 20 programs

🚀 Starting server on http://localhost:5000
Press Ctrl+C to stop
============================================================
```

🎉 **The app is ready!** Open http://localhost:5000 in your browser.
