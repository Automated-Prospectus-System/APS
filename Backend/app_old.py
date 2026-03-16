"""
APS - Automatic Prospectus System
Python Flask Backend
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Configuration
app.config['JSON_SORT_KEYS'] = False

# ==================== DATA MODELS ==================== #

# Universities Data
universities_data = [
    {
        'id': 'nul',
        'name': 'National University of Lesotho',
        'country': 'Lesotho',
        'icon': 'fas fa-university',
        'logo': 'NUL',
        'description': 'A premier institution of higher education in Lesotho offering diverse programs across multiple disciplines.',
        'programs': ['B.Sc. Computer Science', 'B.Sc. Business Administration', 'B.A. History'],
        'website': 'www.nul.ls',
        'contact': '+266 51 006 000',
        'location': 'Roma, Lesotho'
    },
    {
        'id': 'lce',
        'name': 'Lesotho College of Education',
        'country': 'Lesotho',
        'icon': 'fas fa-book',
        'logo': 'LCE',
        'description': 'Dedicated to preparing qualified educators for Lesotho through innovative teacher training programs.',
        'programs': ['B.Ed. Education', 'B.Ed. Secondary Education'],
        'website': 'www.lce.ac.ls',
        'contact': '+266 22 321 234',
        'location': 'Maseru, Lesotho'
    },
    {
        'id': 'botho',
        'name': 'Botho University',
        'country': 'Lesotho',
        'icon': 'fas fa-laptop',
        'logo': 'BU',
        'description': 'A progressive institution specializing in business, IT, and professional development with international standards.',
        'programs': ['B.Sc. Business Administration', 'B.Sc. Information Technology', 'B.Sc. Biotechnology'],
        'website': 'www.botho.ac.ls',
        'contact': '+266 22 316 805',
        'location': 'Maseru, Lesotho'
    },
    {
        'id': 'lerp',
        'name': 'Lerotholi Polytechnic',
        'country': 'Lesotho',
        'icon': 'fas fa-tools',
        'logo': 'LP',
        'description': 'A technical and vocational institution offering diploma and certificate programs in engineering and applied sciences.',
        'programs': ['National Diploma in Electrical Engineering', 'National Diploma in Civil Engineering', 'National Diploma in Mechanical Engineering'],
        'website': 'www.lp.ac.ls',
        'contact': '+266 22 324 000',
        'location': 'Maseru, Lesotho'
    },
    {
        'id': 'limkokwing',
        'name': 'Limkokwing University of Creative Technology',
        'country': 'Lesotho',
        'icon': 'fas fa-palette',
        'logo': 'LUCT',
        'description': 'A specialized institution focusing on creative industries, design, media, and technology education.',
        'programs': ['B.Sc. Information Technology', 'B.A. Graphic Design', 'B.A. Digital Media'],
        'website': 'www.limkokwing.ac.ls',
        'contact': '+266 22 396 500',
        'location': 'Maseru, Lesotho'
    },
    {
        'id': 'auc',
        'name': 'African University College',
        'country': 'Lesotho',
        'icon': 'fas fa-gavel',
        'logo': 'AUC',
        'description': 'An institution dedicated to providing quality education in business, law, and social sciences.',
        'programs': ['B.Sc. Business Administration', 'Bachelor of Laws', 'B.A. Social Sciences'],
        'website': 'www.auc.ac.ls',
        'contact': '+266 22 312 345',
        'location': 'Maseru, Lesotho'
    }
]

# Programs Data
programs_data = [
    {
        'id': 'cs-nul',
        'name': 'B.Sc. Computer Science',
        'university': 'National University of Lesotho',
        'university_id': 'nul',
        'location': 'Lesotho',
        'field': 'Science & Technology',
        'qualification': 'Bachelor',
        'duration': '4 years',
        'minPoints': 6,
        'requirements': [
            {'subject': 'Mathematics', 'minGrade': 'C', 'compulsory': True},
            {'subject': 'English', 'minGrade': 'D', 'compulsory': True},
            {'subject': 'Physical Science', 'minGrade': 'C', 'compulsory': False}
        ],
        'overview': 'Learn the fundamentals of computer science including programming, algorithms, databases, and web development.',
        'website': 'www.nul.ls'
    },
    {
        'id': 'it-botho',
        'name': 'B.Sc. Information Technology',
        'university': 'Botho University',
        'university_id': 'botho',
        'location': 'Lesotho',
        'field': 'Science & Technology',
        'qualification': 'Bachelor',
        'duration': '4 years',
        'minPoints': 6,
        'requirements': [
            {'subject': 'Mathematics', 'minGrade': 'C', 'compulsory': True},
            {'subject': 'English', 'minGrade': 'D', 'compulsory': True},
            {'subject': 'Computer Science', 'minGrade': 'C', 'compulsory': False}
        ],
        'overview': 'Comprehensive IT program focusing on software development, networking, and database management.',
        'website': 'www.botho.ac.ls'
    },
    {
        'id': 'bio-botho',
        'name': 'B.Sc. Biotechnology',
        'university': 'Botho University',
        'university_id': 'botho',
        'location': 'Lesotho',
        'field': 'Science & Technology',
        'qualification': 'Bachelor',
        'duration': '4 years',
        'minPoints': 6,
        'requirements': [
            {'subject': 'Biology', 'minGrade': 'C', 'compulsory': True},
            {'subject': 'Chemistry', 'minGrade': 'C', 'compulsory': True},
            {'subject': 'Mathematics', 'minGrade': 'C', 'compulsory': True}
        ],
        'overview': 'Study the application of biological processes in technology and medicine.',
        'website': 'www.botho.ac.ls'
    },
    {
        'id': 'bus-nul',
        'name': 'B.Sc. Business Administration',
        'university': 'National University of Lesotho',
        'university_id': 'nul',
        'location': 'Lesotho',
        'field': 'Business',
        'qualification': 'Bachelor',
        'duration': '4 years',
        'minPoints': 5,
        'requirements': [
            {'subject': 'Mathematics', 'minGrade': 'D', 'compulsory': True},
            {'subject': 'English', 'minGrade': 'C', 'compulsory': True},
            {'subject': 'Economics', 'minGrade': 'C', 'compulsory': False}
        ],
        'overview': 'Develop business management skills with focus on economics, accounting, and organizational management.',
        'website': 'www.nul.ls'
    },
    {
        'id': 'bus-botho',
        'name': 'B.Sc. Business Administration',
        'university': 'Botho University',
        'university_id': 'botho',
        'location': 'Lesotho',
        'field': 'Business',
        'qualification': 'Bachelor',
        'duration': '3 years',
        'minPoints': 5,
        'requirements': [
            {'subject': 'Mathematics', 'minGrade': 'D', 'compulsory': False},
            {'subject': 'English', 'minGrade': 'C', 'compulsory': True}
        ],
        'overview': 'Professional business administration program with focus on entrepreneurship and management.',
        'website': 'www.botho.ac.ls'
    },
    {
        'id': 'hist-nul',
        'name': 'B.A. History',
        'university': 'National University of Lesotho',
        'university_id': 'nul',
        'location': 'Lesotho',
        'field': 'Arts & Social Sciences',
        'qualification': 'Bachelor',
        'duration': '4 years',
        'minPoints': 5,
        'requirements': [
            {'subject': 'History', 'minGrade': 'C', 'compulsory': True},
            {'subject': 'English', 'minGrade': 'C', 'compulsory': True}
        ],
        'overview': 'Explore world history, cultural heritage, and historical analysis with focus on African history.',
        'website': 'www.nul.ls'
    },
    {
        'id': 'edu-lce',
        'name': 'B.Ed. Education',
        'university': 'Lesotho College of Education',
        'university_id': 'lce',
        'location': 'Lesotho',
        'field': 'Education',
        'qualification': 'Bachelor',
        'duration': '4 years',
        'minPoints': 5,
        'requirements': [
            {'subject': 'English', 'minGrade': 'C', 'compulsory': True},
            {'subject': 'Mathematics', 'minGrade': 'D', 'compulsory': False}
        ],
        'overview': 'Prepare for a career in teaching with comprehensive teacher training and educational practice.',
        'website': 'www.lce.ac.ls'
    },
    {
        'id': 'secedu-lce',
        'name': 'B.Ed. Secondary Education',
        'university': 'Lesotho College of Education',
        'university_id': 'lce',
        'location': 'Lesotho',
        'field': 'Education',
        'qualification': 'Bachelor',
        'duration': '4 years',
        'minPoints': 6,
        'requirements': [
            {'subject': 'English', 'minGrade': 'B', 'compulsory': True},
            {'subject': 'Mathematics', 'minGrade': 'C', 'compulsory': True}
        ],
        'overview': 'Specialized program for secondary school teachers covering advanced subject matter and pedagogy.',
        'website': 'www.lce.ac.ls'
    },
    {
        'id': 'eng-lerp',
        'name': 'National Diploma in Electrical Engineering',
        'university': 'Lerotholi Polytechnic',
        'university_id': 'lerp',
        'location': 'Lesotho',
        'field': 'Engineering',
        'qualification': 'Diploma',
        'duration': '3 years',
        'minPoints': 5,
        'requirements': [
            {'subject': 'Mathematics', 'minGrade': 'C', 'compulsory': True},
            {'subject': 'Physical Science', 'minGrade': 'C', 'compulsory': True}
        ],
        'overview': 'Hands-on technical training in electrical systems, power engineering, and industrial applications.',
        'website': 'www.lp.ac.ls'
    },
    {
        'id': 'civeng-lerp',
        'name': 'National Diploma in Civil Engineering',
        'university': 'Lerotholi Polytechnic',
        'university_id': 'lerp',
        'location': 'Lesotho',
        'field': 'Engineering',
        'qualification': 'Diploma',
        'duration': '3 years',
        'minPoints': 5,
        'requirements': [
            {'subject': 'Mathematics', 'minGrade': 'C', 'compulsory': True},
            {'subject': 'Physical Science', 'minGrade': 'C', 'compulsory': True}
        ],
        'overview': 'Training in construction, infrastructure design, and civil engineering projects.',
        'website': 'www.lp.ac.ls'
    },
    {
        'id': 'design-limkokwing',
        'name': 'B.A. Graphic Design',
        'university': 'Limkokwing University of Creative Technology',
        'university_id': 'limkokwing',
        'location': 'Lesotho',
        'field': 'Arts & Social Sciences',
        'qualification': 'Bachelor',
        'duration': '3 years',
        'minPoints': 4,
        'requirements': [
            {'subject': 'English', 'minGrade': 'D', 'compulsory': True}
        ],
        'overview': 'Creative program in graphic design, visual communication, and digital design principles.',
        'website': 'www.limkokwing.ac.ls'
    },
    {
        'id': 'media-limkokwing',
        'name': 'B.A. Digital Media',
        'university': 'Limkokwing University of Creative Technology',
        'university_id': 'limkokwing',
        'location': 'Lesotho',
        'field': 'Arts & Social Sciences',
        'qualification': 'Bachelor',
        'duration': '3 years',
        'minPoints': 4,
        'requirements': [
            {'subject': 'English', 'minGrade': 'D', 'compulsory': True}
        ],
        'overview': 'Study digital content creation, video production, and multimedia technologies.',
        'website': 'www.limkokwing.ac.ls'
    },
    {
        'id': 'law-auc',
        'name': 'Bachelor of Laws',
        'university': 'African University College',
        'university_id': 'auc',
        'location': 'Lesotho',
        'field': 'Business',
        'qualification': 'Bachelor',
        'duration': '4 years',
        'minPoints': 6,
        'requirements': [
            {'subject': 'English', 'minGrade': 'B', 'compulsory': True},
            {'subject': 'Mathematics', 'minGrade': 'D', 'compulsory': False}
        ],
        'overview': 'Comprehensive legal education covering constitutional law, commercial law, and criminal justice.',
        'website': 'www.auc.ac.ls'
    }
]

# Grade to points mapping
grade_points = {'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0}

# ==================== API ROUTES ==================== #

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'APS Backend is running',
        'timestamp': datetime.now().isoformat()
    }), 200


# Get all universities
@app.route('/api/universities', methods=['GET'])
def get_universities():
    """Get all universities or filter by search term"""
    search = request.args.get('search', '').lower()
    country = request.args.get('country', '')
    
    filtered = universities_data
    
    if search:
        filtered = [u for u in filtered if search in u['name'].lower() or search in u['description'].lower()]
    
    if country:
        filtered = [u for u in filtered if u['country'] == country]
    
    return jsonify({
        'status': 'success',
        'data': filtered,
        'total': len(filtered)
    }), 200


# Get single university by ID
@app.route('/api/universities/<university_id>', methods=['GET'])
def get_university(university_id):
    """Get a single university by ID"""
    university = next((u for u in universities_data if u['id'] == university_id), None)
    
    if not university:
        return jsonify({
            'status': 'error',
            'message': 'University not found'
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': university
    }), 200


# Get all programs
@app.route('/api/programs', methods=['GET'])
def get_programs():
    """Get all programs or filter by criteria"""
    field = request.args.get('field', '')
    qualification = request.args.get('qualification', '')
    university_id = request.args.get('university_id', '')
    
    filtered = programs_data
    
    if field:
        filtered = [p for p in filtered if p['field'] == field]
    
    if qualification:
        filtered = [p for p in filtered if p['qualification'] == qualification]
    
    if university_id:
        filtered = [p for p in filtered if p['university_id'] == university_id]
    
    return jsonify({
        'status': 'success',
        'data': filtered,
        'total': len(filtered)
    }), 200


# Get single program by ID
@app.route('/api/programs/<program_id>', methods=['GET'])
def get_program(program_id):
    """Get a single program by ID"""
    program = next((p for p in programs_data if p['id'] == program_id), None)
    
    if not program:
        return jsonify({
            'status': 'error',
            'message': 'Program not found'
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': program
    }), 200


# Check eligibility
@app.route('/api/eligibility', methods=['POST'])
def check_eligibility():
    """
    Check eligibility for programs based on student results
    
    Expected JSON:
    {
        "subjects": [
            {"subject": "Mathematics", "grade": "A"},
            {"subject": "English", "grade": "B"},
            ...
        ]
    }
    """
    data = request.get_json()
    
    if not data or 'subjects' not in data:
        return jsonify({
            'status': 'error',
            'message': 'Missing subjects data'
        }), 400
    
    subjects = data['subjects']
    
    # Validate input
    if not isinstance(subjects, list) or len(subjects) == 0:
        return jsonify({
            'status': 'error',
            'message': 'Subjects must be a non-empty list'
        }), 400
    
    # Convert subjects to dictionary for easier lookup
    student_subjects = {}
    total_points = 0
    
    for subject in subjects:
        if 'subject' not in subject or 'grade' not in subject:
            return jsonify({
                'status': 'error',
                'message': 'Each subject must have "subject" and "grade" fields'
            }), 400
        
        grade = subject['grade'].upper()
        if grade not in grade_points:
            return jsonify({
                'status': 'error',
                'message': f'Invalid grade: {grade}. Must be A, B, C, D, or E'
            }), 400
        
        student_subjects[subject['subject']] = grade
        total_points += grade_points[grade]
    
    # Check eligibility for each program
    eligible_programs = []
    borderline_programs = []
    not_eligible_programs = []
    
    for program in programs_data:
        is_eligible = True
        missing_subjects = []
        
        # Check compulsory subjects
        for req in program['requirements']:
            if req['compulsory']:
                if req['subject'] not in student_subjects:
                    is_eligible = False
                    missing_subjects.append(req['subject'])
                else:
                    student_grade = student_subjects[req['subject']]
                    if grade_points[student_grade] < grade_points[req['minGrade']]:
                        is_eligible = False
        
        # Check minimum points
        if total_points < program['minPoints']:
            is_eligible = False
        
        # Categorize
        if is_eligible:
            eligible_programs.append(program)
        elif not missing_subjects and (total_points + (program['minPoints'] - total_points)) <= 2:
            # Borderline: close to minimum points
            borderline_programs.append(program)
        else:
            not_eligible_programs.append(program)
    
    return jsonify({
        'status': 'success',
        'data': {
            'eligible': eligible_programs,
            'borderline': borderline_programs,
            'not_eligible': not_eligible_programs,
            'total_points': total_points,
            'summary': {
                'eligible_count': len(eligible_programs),
                'borderline_count': len(borderline_programs),
                'total_programs_checked': len(programs_data)
            }
        }
    }), 200


# Get all unique fields of study
@app.route('/api/fields', methods=['GET'])
def get_fields():
    """Get all unique fields of study"""
    fields = list(set(p['field'] for p in programs_data))
    return jsonify({
        'status': 'success',
        'data': sorted(fields)
    }), 200


# Get all unique qualifications
@app.route('/api/qualifications', methods=['GET'])
def get_qualifications():
    """Get all unique qualifications"""
    qualifications = list(set(p['qualification'] for p in programs_data))
    return jsonify({
        'status': 'success',
        'data': sorted(qualifications)
    }), 200


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Resource not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500


# ==================== MAIN ==================== #

if __name__ == '__main__':
    print("=" * 50)
    print("🎓 APS - Automatic Prospectus System")
    print("Backend Server Started")
    print("=" * 50)
    print("\n📡 API Documentation:")
    print("  GET  /api/health               - Health check")
    print("  GET  /api/universities         - Get all universities")
    print("  GET  /api/universities/<id>    - Get single university")
    print("  GET  /api/programs             - Get all programs")
    print("  GET  /api/programs/<id>        - Get single program")
    print("  POST /api/eligibility          - Check eligibility")
    print("  GET  /api/fields               - Get all fields of study")
    print("  GET  /api/qualifications       - Get all qualifications")
    print("\n🌐 Server running on http://localhost:5000")
    print("=" * 50 + "\n")
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
