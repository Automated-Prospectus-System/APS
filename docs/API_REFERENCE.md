# APS API Quick Reference

## Backend Server
- **URL**: `http://localhost:5000`
- **Status**: Run `python3 app.py` to start
- **CORS**: Enabled for all origins in development

---

## API Endpoints

### Health Check
```
GET /api/health
Response: {"status": "running", "timestamp": "2024-01-15T10:30:00"}
```

### Universities

#### List All Universities
```
GET /api/universities
Query Parameters:
  - search: Filter by name/description (optional)
  - country: Filter by country (optional)

Example: http://localhost:5000/api/universities?search=National
Response: [
  {
    "id": 1,
    "name": "National University of Lesotho",
    "country": "Lesotho",
    "icon": "fa-building",
    "description": "..."
  }
]
```

#### Get Single University
```
GET /api/universities/<id>
Example: http://localhost:5000/api/universities/1
Response: {
  "id": 1,
  "name": "National University of Lesotho",
  ...
}
```

### Programs

#### List All Programs
```
GET /api/programs
Query Parameters:
  - field: Filter by field of study (optional)
  - qualification: Filter by qualification type (optional)
  - university_id: Filter by university (optional)

Example: http://localhost:5000/api/programs?field=Engineering
Response: [
  {
    "id": 1,
    "name": "Bachelor of Science in Engineering",
    "field": "Engineering",
    "qualification": "Bachelor",
    "requirements": {...}
  }
]
```

#### Get Single Program
```
GET /api/programs/<id>
Example: http://localhost:5000/api/programs/1
```

### Eligibility Check (Core Feature)
```
POST /api/eligibility

Request Body:
{
  "subjects": [
    {"subject": "Mathematics", "grade": "A"},
    {"subject": "English", "grade": "B"},
    {"subject": "Science", "grade": "C"},
    {"subject": "Geography", "grade": "B"}
  ]
}

Response: {
  "eligible": [
    {
      "id": 1,
      "name": "Bachelor of Science in Engineering",
      "university": "National University of Lesotho",
      "score": 11,
      "min_score": 10
    }
  ],
  "borderline": [...],
  "not_eligible": [...],
  "summary": {
    "total_checked": 13,
    "eligible_count": 5,
    "borderline_count": 2,
    "not_eligible_count": 6,
    "total_score": 11
  }
}
```

**Grading System**:
- A = 4 points
- B = 3 points
- C = 2 points
- D = 1 point
- E = 0 points

### Filters

#### Get Fields of Study
```
GET /api/fields
Response: ["Engineering", "Medicine", "Business", "Education", ...]
```

#### Get Qualification Types
```
GET /api/qualifications
Response: ["Bachelor", "Diploma", "Certificate", "Masters", ...]
```

---

## Testing with cURL

### Check if backend is running
```bash
curl http://localhost:5000/api/health
```

### Get all universities
```bash
curl http://localhost:5000/api/universities
```

### Check eligibility
```bash
curl -X POST http://localhost:5000/api/eligibility \
  -H "Content-Type: application/json" \
  -d '{
    "subjects": [
      {"subject": "Mathematics", "grade": "A"},
      {"subject": "English", "grade": "B"},
      {"subject": "Science", "grade": "A"},
      {"subject": "Geography", "grade": "C"}
    ]
  }'
```

---

## Frontend Integration

The frontend (`index.html`) automatically calls these endpoints when you:
1. **Fill the exam scores form** → Calls `/api/eligibility`
2. **Use filters** → Calls `/api/programs` with filter parameters
3. **Search universities** → Calls `/api/universities` with search parameter
4. **View program details** → Calls `/api/programs/<id>`

All calls are made through `script-api.js` with fallback to local data if API is unavailable.

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Backend not responding | Make sure Python server is running: `python3 app.py` |
| CORS errors | CORS is enabled by default, check browser console |
| No programs showing | Check that `/api/programs` returns data |
| Eligibility always shows nothing | Verify POST data format matches expected structure |
| Frontend using old data | Clear browser cache or hard refresh (Ctrl+Shift+R) |

---

## Next Phase: Database Integration

Current state: **In-memory data** (suitable for development/testing)

To add a real database:
1. Update `requirements.txt` to include `sqlalchemy`, `cx_Oracle` or `psycopg2`
2. In `app.py`, replace array access with ORM queries
3. Update `/api/programs` route:
   ```python
   # Current (in-memory):
   programs = [p for p in programsData if p['field'] == field]
   
   # Future (database):
   programs = db.query(Program).filter(Program.field == field).all()
   ```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0  
**Status**: Production Ready (awaiting DB integration)
