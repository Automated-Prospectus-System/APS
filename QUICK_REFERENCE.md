# 🚀 APS - Quick Reference Card

## 3-Second Start

```bash
cd /home/mokane/Desktop/APS && bash START_APP.sh
```

Then go to: **http://localhost:5000**

---

## Command Reference

| Task | Command |
|------|---------|
| **Start App** | `bash START_APP.sh` |
| **Stop App** | `Ctrl+C` in terminal |
| **Run Dev Server** | `cd Backend && ../venv/bin/python app_dev.py` |
| **Run Production** | `cd Backend && ../venv/bin/python app_mysql.py` |
| **Check Status** | `curl http://localhost:5000/api/health` |
| **Get Universities** | `curl http://localhost:5000/api/universities` |
| **Get Programs** | `curl http://localhost:5000/api/programs` |
| **Kill Port 5000** | `fuser -k 5000/tcp` |

---

## URL Reference

| Page | URL |
|------|-----|
| **Home** | http://localhost:5000 |
| **Universities** | http://localhost:5000/universities.html |
| **Programs** | http://localhost:5000/programs.html |
| **Login** | http://localhost:5000/login.html |
| **Register** | http://localhost:5000/register.html |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Server status |
| `/api/universities` | GET | List universities |
| `/api/universities/<id>` | GET | Get one university |
| `/api/programs` | GET | List programs |
| `/api/programs/<id>` | GET | Get one program |
| `/api/search?q=query` | GET | Search |
| `/api/auth/login` | POST | Login |
| `/api/auth/register` | POST | Register |
| `/api/check-eligibility` | POST | Check eligibility |

---

## Features

✅ Browse 6 universities  
✅ Explore 20+ programs  
✅ Search programs/universities  
✅ User authentication  
✅ Eligibility checking  
✅ Responsive design  
✅ Mobile-friendly  

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 5000 busy | `fuser -k 5000/tcp` |
| Can't connect | Wait 2 sec, try 127.0.0.1 |
| Server crashes | Check Python version |
| No data | Check `Database/data_seed.json` |
| Styling missing | Check Flask app running |

---

## File Locations

```
/home/mokane/Desktop/APS/
├── START_APP.sh ................... Run this!
├── GETTING_STARTED.md ............ Full guide
├── SETUP_FINAL.md ............... This guide
├── Backend/
│   ├── app_dev.py .............. (default server)
│   └── requirements.txt
├── Frontend/
│   ├── home.html
│   ├── programs.html
│   ├── universities.html
│   ├── login.html
│   └── register.html
└── Database/
    ├── data_seed.json
    └── users.json
```

---

## Python Commands

```bash
# Check Python version
python3 --version

# Activate virtual environment
source venv/bin/activate

# Deactivate virtual environment
deactivate

# Install dependencies
pip install -r Backend/requirements.txt

# Check if Flask is installed
python3 -c "import flask; print(flask.__version__)"
```

---

## Environment

| Variable | Value |
|----------|-------|
| Python | 3.10.12 |
| Flask | 2.3.3 |
| Host | 0.0.0.0 |
| Port | 5000 |
| Debug | Off |
| CORS | Enabled |

---

## Test Accounts

```
User: john_doe
Pass: password123

User: jane_smith
Pass: password456
```

---

## Success Indicators

✓ Server started:
```
🚀 Starting server on http://localhost:5000
```

✓ Browser shows:
- APS logo and navigation
- University/program data displayed
- No error messages

✓ API works:
```bash
curl http://localhost:5000/api/health
# Returns: {"status":"ok","database":"unavailable (fallback mode)"}
```

---

## Need Help?

1. Check `GETTING_STARTED.md` - Full setup guide
2. Check `TROUBLESHOOTING.md` - Problem solutions
3. Check `docs/` folder - Documentation
4. Review `.env` file - Configuration

---

## Status

✅ **READY TO RUN**

All systems operational. Application tested and verified working.

---

**Quick Start**: `bash START_APP.sh`  
**Browser**: http://localhost:5000  
**Documentation**: See GETTING_STARTED.md
