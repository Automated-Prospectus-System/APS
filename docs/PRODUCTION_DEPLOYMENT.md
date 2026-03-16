# APS System - Production Deployment Guide

## 📋 System Overview

**Automatic Prospectus System (APS)** - Lesotho Higher Education Guidance Platform

- **Type**: Full-stack web application
- **Backend**: Flask + Python
- **Frontend**: HTML5 + Vanilla JavaScript
- **Database**: JSON-based (no MySQL required for deployment)
- **Authentication**: File-based user management
- **Data**: 6 universities, 20+ programs from seed data

---

## 🚀 Quick Deployment (One-Command Setup)

### Prerequisites
- Python 3.7+
- pip (Python package manager)
- 2GB disk space

### Installation & Launch

```bash
# 1. Install dependencies
pip install Flask==2.3.3 Flask-CORS==4.0.0 python-dotenv==1.0.0

# 2. Navigate to project directory
cd /path/to/APS

# 3. Start the server
python3 app_mysql.py
```

**The application will be available at**: `http://localhost:5000`

---

## 🔐 User Credentials

### Default Users (All password: `password123`)

| Username | Name | Email | Role |
|----------|------|-------|------|
| admin | Administrator | admin@apssystem.com | admin |
| student1 | John Student | student1@apssystem.com | student |
| student2 | Jane Scholar | student2@apssystem.com | student |

**To add more users**, edit `users.json` in the project root.

---

## 📁 Project Structure

```
APS/
├── app_mysql.py              # Backend Flask application
├── auth.js                   # Frontend authentication
├── script-api.js             # API client (frontend)
├── style.css                 # Global styles
├── login.html                # Login page
├── home.html                 # Dashboard
├── programs.html             # Programs listing
├── universities.html         # Universities directory
├── users.json                # User database
├── data_seed.json            # University & program data
├── requirements.txt          # Python dependencies
├── database/
│   ├── db_manager.py        # Database layer
│   └── schema.sql           # Database schema (optional)
└── data_extraction/          # PDF & web scraping modules
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
HOST=0.0.0.0

# Database (Optional - uses JSON fallback if MySQL unavailable)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=aps_system
```

### API Configuration

Edit `script-api.js` to change the API endpoint:

```javascript
const API_BASE_URL = 'http://your-domain.com:5000/api'\;
```

---

## 📊 Features & Data

### Universities (6 total)
1. National University of Lesotho (NUL)
2. Lerotholi Polytechnic (LP)
3. Lesotho College of Education (LCE)
4. Botho University Lesotho (BUL)
5. Limkokwing University of Creative Technology (LUCT)
6. African University College of Communications (AUCC)

### Programs (20 total)
- Engineering programs (Bachelor, Diploma)
- Business and Management
- Education programs
- Medicine and Health
- Law
- IT and Computer Science
- Media and Communications
- And more...

### Features
✅ User authentication  
✅ University directory with search  
✅ Program browser with filters  
✅ Eligibility checker  
✅ Responsive design  
✅ No database setup required  

---

## 🌐 Hosting Options

### Option 1: AWS EC2 (Recommended)

```bash
# 1. Launch Ubuntu 20.04 instance
# 2. Connect via SSH
# 3. Install Python
sudo apt-get update
sudo apt-get install python3 python3-pip

# 4. Clone/upload project
git clone <your-repo> /home/ubuntu/aps
cd /home/ubuntu/aps

# 5. Install dependencies
pip3 install -r requirements.txt

# 6. Run with Gunicorn (production)
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app_mysql:app
```

### Option 2: Heroku

```bash
# 1. Create Procfile
echo "web: gunicorn -w 4 -b 0.0.0.0:\$PORT app_mysql:app" > Procfile

# 2. Deploy
heroku login
heroku create aps-system
git push heroku main

# Access at: https://aps-system.herokuapp.com
```

### Option 3: DigitalOcean App Platform

1. Connect GitHub repo
2. Create new app
3. Set build command: `pip3 install -r requirements.txt`
4. Set run command: `gunicorn -w 4 -b 0.0.0.0:5000 app_mysql:app`
5. Deploy

### Option 4: Docker (for any hosting)

Create `Dockerfile`:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app_mysql:app"]
```

Build and run:
```bash
docker build -t aps-system .
docker run -p 5000:5000 aps-system
```

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change all default passwords in `users.json`
- [ ] Set `FLASK_DEBUG=False` in environment
- [ ] Use HTTPS/SSL certificate
- [ ] Enable CORS only for your domain
- [ ] Set strong session secrets
- [ ] Regular backups of `users.json` and `data_seed.json`
- [ ] Monitor server logs
- [ ] Implement rate limiting
- [ ] Use Web Application Firewall (WAF)

---

## 📈 Performance Optimization

### Enable Caching
```python
# Add to app_mysql.py
@app.after_request
def add_header(response):
    response.cache_control.max_age = 300
    return response
```

### Use CDN for Static Files
- Host CSS, JS, fonts on CloudFront or Cloudflare
- Update HTML to reference CDN URLs

### Database Optimization
- If using MySQL in future, add proper indexes
- Use connection pooling
- Cache frequently accessed data

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: "Port 5000 already in use"
```bash
# Kill the process
lsof -ti:5000 | xargs kill -9
```

**Issue**: API returns 404
- Check if backend is running: `curl http://localhost:5000/api/health`
- Verify API endpoint in `script-api.js`

**Issue**: Login fails
- Verify user exists in `users.json`
- Check password is correct: `password123`
- Check browser console for errors (F12)

**Issue**: CORS errors (when hosted on different domain)
- Update CORS settings in `app_mysql.py`
- Update API_BASE_URL in `script-api.js`

---

## 📊 Monitoring & Maintenance

### Server Monitoring
```bash
# Check server status
curl http://your-domain:5000/api/health

# View logs (if using Gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 --access-logfile - --error-logfile - app_mysql:app
```

### Update Data
- Edit `data_seed.json` to add/modify universities or programs
- Restart server for changes to take effect

### Backup Important Files
```bash
cp users.json users.json.backup
cp data_seed.json data_seed.json.backup
```

---

## 🚀 Going Live Checklist

- [ ] Test all features on production URL
- [ ] Verify login with all user accounts
- [ ] Test university search and filters
- [ ] Test programs listing and eligibility checker
- [ ] Check mobile responsiveness
- [ ] Verify database connection or fallback working
- [ ] Set up domain/DNS
- [ ] Configure SSL certificate
- [ ] Enable backups
- [ ] Set up monitoring
- [ ] Document admin procedures
- [ ] Create user guide

---

## 📝 Additional Notes

### Database Migration (if needed later)
If you want to migrate to a real MySQL database:

1. Set up MySQL server
2. Create database: `CREATE DATABASE aps_system;`
3. Run schema: `mysql aps_system < database/schema.sql`
4. Load data: `python3 database/data_loader.py`
5. Update `DB_CONFIG` environment variables

### Scaling
For large traffic:
1. Use load balancer (AWS ELB, Nginx)
2. Deploy multiple app instances
3. Use Redis for session caching
4. Move data to proper database
5. Use CDN for assets

---

**Ready to deploy? Start with:**
```bash
python3 app_mysql.py
```

Then visit: `http://localhost:5000`

---

*Last Updated: March 10, 2026*
*Version: 2.0 - Production Ready*

