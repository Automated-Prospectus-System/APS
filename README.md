# APS - Automatic Prospectus System

A comprehensive web-based platform for university and college prospectus management and student eligibility checking in Lesotho.

## 🎯 Features

- **University & College Directory** - Browse all Lesotho institutions
- **Program Explorer** - Search and filter academic programs
- **Eligibility Checker** - Check which programs you qualify for based on LGCSE results
- **Advanced Filtering** - Filter by field of study, qualification type, and institution
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Professional UI** - Modern interface with Font Awesome icons

## 🏗️ Project Structure

```
APS/
├── index.html              # Home page
├── programs.html           # Programs exploration page
├── universities.html       # Universities directory page
├── login.html             # Admin login page
├── style.css              # Main stylesheet
├── script-api.js          # JavaScript with API integration
├── app.py                 # Python Flask backend
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser

### Backend Setup

1. **Navigate to the project directory:**
   ```bash
   cd /home/mokane/Desktop/APS
   ```

2. **Create a virtual environment (Optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server:**
   ```bash
   python app.py
   ```

   The server will start on `http://localhost:5000`

   You should see:
   ```
   ==================================================
   🎓 APS - Automatic Prospectus System
   Backend Server Started
   ==================================================

   📡 API Documentation:
   GET  /api/health               - Health check
   GET  /api/universities         - Get all universities
   GET  /api/universities/<id>    - Get single university
   GET  /api/programs             - Get all programs
   GET  /api/programs/<id>        - Get single program
   POST /api/eligibility          - Check eligibility
   GET  /api/fields               - Get all fields of study
   GET  /api/qualifications       - Get all qualifications

   🌐 Server running on http://localhost:5000
   ==================================================
   ```

### Frontend Setup

1. **Open a web browser and navigate to:**
   ```
   file:///home/mokane/Desktop/APS/index.html
   ```

   Or use a local web server:
   ```bash
   # Using Python (in the APS directory)
   python -m http.server 8000
   ```
   
   Then open `http://localhost:8000` in your browser.

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```
Check if the backend is running.

#### Universities

**Get all universities:**
```http
GET /api/universities
```

Query Parameters:
- `search` (optional) - Search term
- `country` (optional) - Filter by country

Example:
```bash
curl "http://localhost:5000/api/universities?search=National"
```

**Get single university:**
```http
GET /api/universities/:id
```

#### Programs

**Get all programs:**
```http
GET /api/programs
```

Query Parameters:
- `field` (optional) - Field of study
- `qualification` (optional) - Qualification type (Bachelor, Diploma)
- `university_id` (optional) - Filter by university

Example:
```bash
curl "http://localhost:5000/api/programs?field=Science%20%26%20Technology"
```

**Get single program:**
```http
GET /api/programs/:id
```

#### Eligibility Check

```http
POST /api/eligibility
Content-Type: application/json

{
  "subjects": [
    {"subject": "Mathematics", "grade": "A"},
    {"subject": "English", "grade": "B"},
    {"subject": "Physical Science", "grade": "C"}
  ]
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "eligible": [...],
    "borderline": [...],
    "not_eligible": [...],
    "total_points": 9,
    "summary": {
      "eligible_count": 5,
      "borderline_count": 2,
      "total_programs_checked": 13
    }
  }
}
```

#### Fields of Study
```http
GET /api/fields
```

#### Qualifications
```http
GET /api/qualifications
```

## 🗄️ Database Integration

The current implementation uses in-memory data. To integrate with a database (Oracle, PostgreSQL, etc.):

1. **Install a database driver:**
   ```bash
   pip install flask-sqlalchemy
   # or
   pip install cx_Oracle  # For Oracle
   ```

2. **Update `app.py` to use SQLAlchemy:**
   - Define database models
   - Configure database connection
   - Replace in-memory data with database queries

3. **Example database models:**
   ```python
   from flask_sqlalchemy import SQLAlchemy
   
   db = SQLAlchemy(app)
   
   class University(db.Model):
       id = db.Column(db.String(50), primary_key=True)
       name = db.Column(db.String(200), nullable=False)
       country = db.Column(db.String(100))
       contact = db.Column(db.String(20))
       ...
   
   class Program(db.Model):
       id = db.Column(db.String(50), primary_key=True)
       name = db.Column(db.String(200), nullable=False)
       university_id = db.Column(db.String(50), db.ForeignKey('university.id'))
       ...
   ```

## 🎨 Frontend Features

### Home Page (`index.html`)
- Exam results entry form
- Program filtering options
- Recommended programs display
- Eligibility report section

### Programs Page (`programs.html`)
- Browse all academic programs
- Filter by field of study and qualification
- View program details in modal

### Universities Page (`universities.html`)
- Search universities and colleges
- View university information
- Access university websites

### Login Page (`login.html`)
- Admin authentication
- Demo credentials: `admin` / `admin123`

## 🔧 Configuration

### CORS (Cross-Origin Resource Sharing)
The backend is configured to accept requests from any origin. To restrict this:

```python
# In app.py
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8000", "http://127.0.0.1:8000"]
    }
})
```

### API Base URL
The frontend uses `http://localhost:5000/api` by default. To change:

Edit `script-api.js`:
```javascript
const API_BASE_URL = 'http://your-api-host:port/api';
```

## 📊 Data Models

### University
```json
{
  "id": "nul",
  "name": "National University of Lesotho",
  "country": "Lesotho",
  "icon": "fas fa-university",
  "logo": "NUL",
  "description": "...",
  "programs": [...],
  "website": "www.nul.ls",
  "contact": "+266 51 006 000",
  "location": "Roma, Lesotho"
}
```

### Program
```json
{
  "id": "cs-nul",
  "name": "B.Sc. Computer Science",
  "university": "National University of Lesotho",
  "university_id": "nul",
  "location": "Lesotho",
  "field": "Science & Technology",
  "qualification": "Bachelor",
  "duration": "4 years",
  "minPoints": 6,
  "requirements": [
    {"subject": "Mathematics", "minGrade": "C", "compulsory": true},
    ...
  ],
  "overview": "...",
  "website": "www.nul.ls"
}
```

## 🔐 Security Considerations

For production deployment:

1. **Environment Variables** - Store sensitive data in `.env` files
2. **Authentication** - Implement JWT or session-based authentication
3. **Input Validation** - Validate all user inputs
4. **HTTPS** - Use SSL/TLS certificates
5. **Rate Limiting** - Implement rate limiting to prevent abuse
6. **CORS** - Restrict to specific domains

### Example `.env` file:
```
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=oracle://user:password@host:1521/dbname
SECRET_KEY=your-secret-key-here
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px and above)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🎓 Universities Included

1. **National University of Lesotho** (NUL)
2. **Lesotho College of Education** (LCE)
3. **Botho University** (BU)
4. **Lerotholi Polytechnic** (LP)
5. **Limkokwing University of Creative Technology** (LUCT)
6. **African University College** (AUC)

## 🚀 Deployment

### Using Gunicorn (Recommended for Production)

1. **Install Gunicorn:**
   ```bash
   pip install gunicorn
   ```

2. **Run the application:**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Using Docker

Create a `Dockerfile`:
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t aps-backend .
docker run -p 5000:5000 aps-backend
```

## 📝 License

This project is open source and available for educational purposes.

## 👥 Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues or questions, please create an issue in the project repository.

## 🔄 Future Enhancements

- [ ] Database integration (Oracle/PostgreSQL)
- [ ] User authentication and profiles
- [ ] Application history tracking
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Mobile app (React Native/Flutter)
- [ ] AI-based career guidance
- [ ] Scholarship eligibility checker
- [ ] Direct university portal integration
- [ ] Administrative dashboard

---

**Last Updated:** March 10, 2026
**Version:** 1.0.0
**Status:** Production Ready
