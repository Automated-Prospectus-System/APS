// ==================== DATA ==================== //

// Sample programs data
const programsData = [
    {
        id: 'cs-nul',
        name: 'B.Sc. Computer Science',
        university: 'National University of Lesotho',
        location: 'Lesotho',
        field: 'Science & Technology',
        qualification: 'Bachelor',
        duration: '4 years',
        minPoints: 6,
        requirements: [
            { subject: 'Mathematics', minGrade: 'C', compulsory: true },
            { subject: 'English', minGrade: 'D', compulsory: true },
            { subject: 'Physical Science', minGrade: 'C', compulsory: false }
        ],
        overview: 'Learn the fundamentals of computer science including programming, algorithms, databases, and web development.',
        website: 'www.nul.ls'
    },
    {
        id: 'it-botho',
        name: 'B.Sc. Information Technology',
        university: 'Botho University',
        location: 'Lesotho',
        field: 'Science & Technology',
        qualification: 'Bachelor',
        duration: '4 years',
        minPoints: 6,
        requirements: [
            { subject: 'Mathematics', minGrade: 'C', compulsory: true },
            { subject: 'English', minGrade: 'D', compulsory: true },
            { subject: 'Computer Science', minGrade: 'C', compulsory: false }
        ],
        overview: 'Comprehensive IT program focusing on software development, networking, and database management.',
        website: 'www.botho.ac.ls'
    },
    {
        id: 'bio-botho',
        name: 'B.Sc. Biotechnology',
        university: 'Botho University',
        location: 'Lesotho',
        field: 'Science & Technology',
        qualification: 'Bachelor',
        duration: '4 years',
        minPoints: 6,
        requirements: [
            { subject: 'Biology', minGrade: 'C', compulsory: true },
            { subject: 'Chemistry', minGrade: 'C', compulsory: true },
            { subject: 'Mathematics', minGrade: 'C', compulsory: true }
        ],
        overview: 'Study the application of biological processes in technology and medicine.',
        website: 'www.botho.ac.ls'
    },
    {
        id: 'bus-nul',
        name: 'B.Sc. Business Administration',
        university: 'National University of Lesotho',
        location: 'Lesotho',
        field: 'Business',
        qualification: 'Bachelor',
        duration: '4 years',
        minPoints: 5,
        requirements: [
            { subject: 'Mathematics', minGrade: 'D', compulsory: true },
            { subject: 'English', minGrade: 'C', compulsory: true },
            { subject: 'Economics', minGrade: 'C', compulsory: false }
        ],
        overview: 'Develop business management skills with focus on economics, accounting, and organizational management.',
        website: 'www.nul.ls'
    },
    {
        id: 'bus-botho',
        name: 'B.Sc. Business Administration',
        university: 'Botho University',
        location: 'Lesotho',
        field: 'Business',
        qualification: 'Bachelor',
        duration: '3 years',
        minPoints: 5,
        requirements: [
            { subject: 'Mathematics', minGrade: 'D', compulsory: false },
            { subject: 'English', minGrade: 'C', compulsory: true }
        ],
        overview: 'Professional business administration program with focus on entrepreneurship and management.',
        website: 'www.botho.ac.ls'
    },
    {
        id: 'hist-nul',
        name: 'B.A. History',
        university: 'National University of Lesotho',
        location: 'Lesotho',
        field: 'Arts & Social Sciences',
        qualification: 'Bachelor',
        duration: '4 years',
        minPoints: 5,
        requirements: [
            { subject: 'History', minGrade: 'C', compulsory: true },
            { subject: 'English', minGrade: 'C', compulsory: true }
        ],
        overview: 'Explore world history, cultural heritage, and historical analysis with focus on African history.',
        website: 'www.nul.ls'
    },
    {
        id: 'edu-lce',
        name: 'B.Ed. Education',
        university: 'Lesotho College of Education',
        location: 'Lesotho',
        field: 'Education',
        qualification: 'Bachelor',
        duration: '4 years',
        minPoints: 5,
        requirements: [
            { subject: 'English', minGrade: 'C', compulsory: true },
            { subject: 'Mathematics', minGrade: 'D', compulsory: false }
        ],
        overview: 'Prepare for a career in teaching with comprehensive teacher training and educational practice.',
        website: 'www.lce.ac.ls'
    },
    {
        id: 'secedu-lce',
        name: 'B.Ed. Secondary Education',
        university: 'Lesotho College of Education',
        location: 'Lesotho',
        field: 'Education',
        qualification: 'Bachelor',
        duration: '4 years',
        minPoints: 6,
        requirements: [
            { subject: 'English', minGrade: 'B', compulsory: true },
            { subject: 'Mathematics', minGrade: 'C', compulsory: true }
        ],
        overview: 'Specialized program for secondary school teachers covering advanced subject matter and pedagogy.',
        website: 'www.lce.ac.ls'
    },
    {
        id: 'eng-lerp',
        name: 'National Diploma in Electrical Engineering',
        university: 'Lerotholi Polytechnic',
        location: 'Lesotho',
        field: 'Engineering',
        qualification: 'Diploma',
        duration: '3 years',
        minPoints: 5,
        requirements: [
            { subject: 'Mathematics', minGrade: 'C', compulsory: true },
            { subject: 'Physical Science', minGrade: 'C', compulsory: true }
        ],
        overview: 'Hands-on technical training in electrical systems, power engineering, and industrial applications.',
        website: 'www.lp.ac.ls'
    },
    {
        id: 'civeng-lerp',
        name: 'National Diploma in Civil Engineering',
        university: 'Lerotholi Polytechnic',
        location: 'Lesotho',
        field: 'Engineering',
        qualification: 'Diploma',
        duration: '3 years',
        minPoints: 5,
        requirements: [
            { subject: 'Mathematics', minGrade: 'C', compulsory: true },
            { subject: 'Physical Science', minGrade: 'C', compulsory: true }
        ],
        overview: 'Training in construction, infrastructure design, and civil engineering projects.',
        website: 'www.lp.ac.ls'
    },
    {
        id: 'design-limkokwing',
        name: 'B.A. Graphic Design',
        university: 'Limkokwing University of Creative Technology',
        location: 'Lesotho',
        field: 'Arts & Social Sciences',
        qualification: 'Bachelor',
        duration: '3 years',
        minPoints: 4,
        requirements: [
            { subject: 'English', minGrade: 'D', compulsory: true }
        ],
        overview: 'Creative program in graphic design, visual communication, and digital design principles.',
        website: 'www.limkokwing.ac.ls'
    },
    {
        id: 'media-limkokwing',
        name: 'B.A. Digital Media',
        university: 'Limkokwing University of Creative Technology',
        location: 'Lesotho',
        field: 'Arts & Social Sciences',
        qualification: 'Bachelor',
        duration: '3 years',
        minPoints: 4,
        requirements: [
            { subject: 'English', minGrade: 'D', compulsory: true }
        ],
        overview: 'Study digital content creation, video production, and multimedia technologies.',
        website: 'www.limkokwing.ac.ls'
    },
    {
        id: 'law-auc',
        name: 'Bachelor of Laws',
        university: 'African University College',
        location: 'Lesotho',
        field: 'Business',
        qualification: 'Bachelor',
        duration: '4 years',
        minPoints: 6,
        requirements: [
            { subject: 'English', minGrade: 'B', compulsory: true },
            { subject: 'Mathematics', minGrade: 'D', compulsory: false }
        ],
        overview: 'Comprehensive legal education covering constitutional law, commercial law, and criminal justice.',
        website: 'www.auc.ac.ls'
    }
];

// Sample universities data
const universitiesData = [
    {
        id: 'nul',
        name: 'National University of Lesotho',
        country: 'Lesotho',
        icon: 'fas fa-university',
        logo: 'NUL',
        description: 'A premier institution of higher education in Lesotho offering diverse programs across multiple disciplines.',
        programs: ['B.Sc. Computer Science', 'B.Sc. Business Administration', 'B.A. History'],
        website: 'www.nul.ls',
        contact: '+266 51 006 000'
    },
    {
        id: 'lce',
        name: 'Lesotho College of Education',
        country: 'Lesotho',
        icon: 'fas fa-book',
        logo: 'LCE',
        description: 'Dedicated to preparing qualified educators for Lesotho through innovative teacher training programs.',
        programs: ['B.Ed. Education', 'B.Ed. Secondary Education'],
        website: 'www.lce.ac.ls',
        contact: '+266 22 321 234'
    },
    {
        id: 'botho',
        name: 'Botho University',
        country: 'Lesotho',
        icon: 'fas fa-laptop',
        logo: 'BU',
        description: 'A progressive institution specializing in business, IT, and professional development with international standards.',
        programs: ['B.Sc. Business Administration', 'B.Sc. Information Technology', 'B.Sc. Biotechnology'],
        website: 'www.botho.ac.ls',
        contact: '+266 22 316 805'
    },
    {
        id: 'lerp',
        name: 'Lerotholi Polytechnic',
        country: 'Lesotho',
        icon: 'fas fa-tools',
        logo: 'LP',
        description: 'A technical and vocational institution offering diploma and certificate programs in engineering and applied sciences.',
        programs: ['National Diploma in Electrical Engineering', 'National Diploma in Civil Engineering', 'National Diploma in Mechanical Engineering'],
        website: 'www.lp.ac.ls',
        contact: '+266 22 324 000'
    },
    {
        id: 'limkokwing',
        name: 'Limkokwing University of Creative Technology',
        country: 'Lesotho',
        icon: 'fas fa-palette',
        logo: 'LUCT',
        description: 'A specialized institution focusing on creative industries, design, media, and technology education.',
        programs: ['B.Sc. Information Technology', 'B.A. Graphic Design', 'B.A. Digital Media'],
        website: 'www.limkokwing.ac.ls',
        contact: '+266 22 396 500'
    },
    {
        id: 'auc',
        name: 'African University College',
        country: 'Lesotho',
        icon: 'fas fa-gavel',
        logo: 'AUC',
        description: 'An institution dedicated to providing quality education in business, law, and social sciences.',
        programs: ['B.Sc. Business Administration', 'Bachelor of Laws', 'B.A. Social Sciences'],
        website: 'www.auc.ac.ls',
        contact: '+266 22 312 345'
    }
];

// Grade to points mapping
const gradePoints = {
    'A': 4,
    'B': 3,
    'C': 2,
    'D': 1,
    'E': 0
};

// ==================== PAGE NAVIGATION ==================== //
// Multi-page navigation is handled by HTML anchors

// ==================== FORM HANDLING ==================== //

// Add subject input
function addSubject() {
    const container = document.getElementById('subjectsContainer');
    const subjectCount = container.querySelectorAll('.subject-entry').length;

    if (subjectCount < 10) {
        const newEntry = document.createElement('div');
        newEntry.className = 'subject-entry';
        newEntry.innerHTML = `
            <select class="subject-select" required>
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Physical Science">Physical Science</option>
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Computer Science">Computer Science</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Economics">Economics</option>
            </select>
            <select class="grade-select" required>
                <option value="">Grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
            </select>
            <button type="button" class="btn-remove" onclick="removeSubject(this)">Remove</button>
        `;
        container.appendChild(newEntry);
    }
}

// Remove subject input
function removeSubject(button) {
    button.closest('.subject-entry').remove();
}

// Handle exam form submission
document.addEventListener('DOMContentLoaded', function() {
    const examForm = document.getElementById('examForm');
    if (examForm) {
        examForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processEligibility();
        });
    }
});

// Process eligibility
function processEligibility() {
    const subjects = [];
    const subjectEntries = document.querySelectorAll('.subject-entry');

    // Collect subject data
    subjectEntries.forEach(entry => {
        const subject = entry.querySelector('.subject-select').value;
        const grade = entry.querySelector('.grade-select').value;
        if (subject && grade) {
            subjects.push({ subject, grade, points: gradePoints[grade] });
        }
    });

    if (subjects.length === 0) {
        alert('Please select at least one subject with a grade.');
        return;
    }

    // Check eligibility
    const eligiblePrograms = [];
    let totalPoints = subjects.reduce((sum, s) => sum + s.points, 0);

    programsData.forEach(program => {
        let isEligible = true;

        // Check compulsory subjects
        program.requirements.forEach(req => {
            if (req.compulsory) {
                const studentSubject = subjects.find(s => s.subject === req.subject);
                if (!studentSubject || gradePoints[studentSubject.grade] < gradePoints[req.minGrade]) {
                    isEligible = false;
                }
            }
        });

        // Check total points
        if (totalPoints < program.minPoints) {
            isEligible = false;
        }

        if (isEligible) {
            eligiblePrograms.push(program);
        }
    });

    // Display results
    displayEligibilityResults(eligiblePrograms);
}

// Display eligibility results
function displayEligibilityResults(programs) {
    const reportSection = document.getElementById('eligibilityReport');
    const programsList = document.getElementById('eligibleProgramsList');

    programsList.innerHTML = '';

    if (programs.length === 0) {
        programsList.innerHTML = '<li>No programs match your qualifications. Please review the requirements.</li>';
    } else {
        programs.forEach(program => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${program.name}</strong> - ${program.university}
                <br><small>${program.location} | ${program.duration}</small>
            `;
            programsList.appendChild(li);
        });
    }

    reportSection.style.display = 'block';
    reportSection.scrollIntoView({ behavior: 'smooth' });
}

// ==================== FILTERS ==================== //

function applyFilters() {
    // Redirect to programs page
    window.location.href = 'programs.html';
}

function filterPrograms() {
    const field = document.getElementById('filterField')?.value;
    const country = document.getElementById('filterCountry')?.value;
    const qual = document.getElementById('filterQual')?.value;

    let filtered = programsData;

    if (field) {
        filtered = filtered.filter(p => p.field === field);
    }
    if (country) {
        filtered = filtered.filter(p => p.location === country);
    }
    if (qual) {
        filtered = filtered.filter(p => p.qualification === qual);
    }

    displayPrograms(filtered);
}

function resetFilters() {
    document.getElementById('filterField').value = '';
    document.getElementById('filterCountry').value = '';
    document.getElementById('filterQual').value = '';
    displayPrograms(programsData);
}

function searchUniversities() {
    const searchTerm = document.getElementById('universitySearch').value.toLowerCase();
    const filtered = universitiesData.filter(u =>
        u.name.toLowerCase().includes(searchTerm) ||
        u.description.toLowerCase().includes(searchTerm)
    );
    displayUniversities(filtered);
}

function filterUniversities() {
    const country = document.getElementById('countryFilter').value;
    let filtered = universitiesData;

    if (country) {
        filtered = filtered.filter(u => u.country === country);
    }

    displayUniversities(filtered);
}

// ==================== LOAD AND DISPLAY DATA ==================== //

function loadPrograms() {
    displayPrograms(programsData);
}

function displayPrograms(programs) {
    const container = document.getElementById('programsList');
    container.innerHTML = '';

    programs.forEach(program => {
        const card = document.createElement('div');
        card.className = 'program-item';
        card.innerHTML = `
            <h4><i class="fas fa-graduation-cap"></i> ${program.name}</h4>
            <p><i class="fas fa-map-marker-alt"></i> ${program.university}</p>
            <p><strong><i class="fas fa-layer-group"></i> Field:</strong> ${program.field}</p>
            <p><strong><i class="fas fa-clock"></i> Duration:</strong> ${program.duration}</p>
            <button class="btn-details" onclick="showProgramDetails('${program.id}')"><i class="fas fa-arrow-right"></i> View Details</button>
        `;
        container.appendChild(card);
    });
}

function loadUniversities() {
    displayUniversities(universitiesData);
}

function displayUniversities(universities) {
    const container = document.getElementById('universitiesList');
    container.innerHTML = '';

    universities.forEach(university => {
        const card = document.createElement('div');
        card.className = 'university-card';
        card.innerHTML = `
            <div class="university-card-header">
                <div class="university-logo">
                    <i class="${university.icon}"></i>
                </div>
                <div class="university-info">
                    <h4>${university.name}</h4>
                    <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;"><i class="fas fa-map-marker-alt"></i> ${university.country}</p>
                </div>
            </div>
            <div class="university-card-body">
                <p>${university.description}</p>
                <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${university.contact}</p>
                <p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="#" style="color: var(--secondary-color);">${university.website}</a></p>
                <p><strong><i class="fas fa-book"></i> Programs:</strong> ${university.programs.length} programs</p>
            </div>
            <div class="university-card-footer">
                <button class="btn-map" onclick="showUniversityDetails('${university.id}')"><i class="fas fa-info-circle"></i> View Details</button>
                <button class="btn-view-details"><i class="fas fa-external-link-alt"></i> Visit Site</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==================== MODAL FUNCTIONS ==================== //

function showProgramDetails(programId) {
    const program = programsData.find(p => p.id === programId);
    if (!program) return;

    const modal = document.getElementById('programModal');
    const details = document.getElementById('programDetails');

    let requirementsHTML = `
        <table class="requirements-table">
            <thead>
                <tr>
                    <th><i class="fas fa-book"></i> Subject</th>
                    <th><i class="fas fa-star"></i> Min Grade</th>
                    <th><i class="fas fa-check-circle"></i> Compulsory</th>
                </tr>
            </thead>
            <tbody>
    `;

    program.requirements.forEach(req => {
        requirementsHTML += `
            <tr>
                <td>${req.subject}</td>
                <td>${req.minGrade}</td>
                <td>${req.compulsory ? '<i class="fas fa-check" style="color: var(--success-color);"></i> Yes' : '<i class="fas fa-times" style="color: var(--danger-color);"></i> No'}</td>
            </tr>
        `;
    });

    requirementsHTML += '</tbody></table>';

    details.innerHTML = `
        <div class="program-details-header">
            <h2><i class="fas fa-graduation-cap"></i> ${program.name}</h2>
            <div class="institution">
                <i class="fas fa-building"></i>
                <span>${program.university}</span>
            </div>
        </div>
        <div class="program-details-body">
            <h3><i class="fas fa-info-circle"></i> Overview</h3>
            <p>${program.overview}</p>

            <h3><i class="fas fa-details"></i> Program Details</h3>
            <p><strong><i class="fas fa-certificate"></i> Qualification:</strong> ${program.qualification}</p>
            <p><strong><i class="fas fa-clock"></i> Duration:</strong> ${program.duration}</p>
            <p><strong><i class="fas fa-map-marker-alt"></i> Location:</strong> ${program.location}</p>
            <p><strong><i class="fas fa-chart-line"></i> Minimum Points Required:</strong> ${program.minPoints}</p>

            <h3><i class="fas fa-clipboard-list"></i> Admission Requirements</h3>
            ${requirementsHTML}

            <p style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color); color: #666;">
                <strong><i class="fas fa-globe"></i> Website:</strong> <a href="#" style="color: var(--secondary-color);">${program.website}</a>
            </p>
        </div>
    `;

    modal.style.display = 'block';
}

function showUniversityDetails(universityId) {
    const university = universitiesData.find(u => u.id === universityId);
    if (!university) return;

    const modal = document.getElementById('universityModal');
    const details = document.getElementById('universityDetails');

    const programsList = university.programs.map(p => `<li><i class="fas fa-check"></i> ${p}</li>`).join('');

    details.innerHTML = `
        <div class="program-details-header" style="background: linear-gradient(135deg, #2c5f2d 0%, #196f20 100%);">
            <div class="university-details-logo"><i class="${university.icon}"></i></div>
            <h2>${university.name}</h2>
            <div class="institution">
                <i class="fas fa-map-marker-alt"></i>
                <span>${university.country}</span>
            </div>
        </div>
        <div class="program-details-body">
            <h3><i class="fas fa-info-circle"></i> About</h3>
            <p>${university.description}</p>

            <h3><i class="fas fa-id-card"></i> Contact Information</h3>
            <p><strong><i class="fas fa-phone"></i> Phone:</strong> ${university.contact}</p>
            <p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="#" style="color: var(--secondary-color);">${university.website}</a></p>

            <h3><i class="fas fa-book"></i> Programs Offered</h3>
            <ul>${programsList}</ul>

            <h3><i class="fas fa-clipboard-list"></i> Admission</h3>
            <p>For detailed admission requirements and application procedures, please visit the university's official website or contact their admissions office directly.</p>
        </div>
    `;

    modal.style.display = 'block';
}

function closeProgramModal() {
    document.getElementById('programModal').style.display = 'none';
}

function closeUniversityModal() {
    document.getElementById('universityModal').style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const programModal = document.getElementById('programModal');
    const universityModal = document.getElementById('universityModal');

    if (event.target == programModal) {
        programModal.style.display = 'none';
    }
    if (event.target == universityModal) {
        universityModal.style.display = 'none';
    }
});

// ==================== LOGIN ==================== //

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple validation - in production, this would authenticate with backend
    if (username === 'admin' && password === 'admin123') {
        alert('Login successful! Admin dashboard would load here.');
        // In production, redirect to admin dashboard
    } else {
        alert('Invalid credentials. Try username: admin, password: admin123');
    }
}

// ==================== UTILITIES ==================== //

function downloadReport() {
    alert('PDF download functionality will be implemented with backend integration.');
    // In production, this would generate and download a PDF file
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load default data on home page
    console.log('APES System loaded successfully');
    
    // Add some recommended programs to home page
    const recommendedContainer = document.getElementById('recommendedPrograms');
    if (recommendedContainer) {
        recommendedContainer.innerHTML = '';
        const topPrograms = programsData.slice(0, 3);
        topPrograms.forEach(program => {
            const item = document.createElement('div');
            item.className = 'program-item';
            item.innerHTML = `
                <h4>${program.name}</h4>
                <p><span class="institution-icon">📍</span> ${program.university}</p>
                <button class="btn-details" onclick="showProgramDetails('${program.id}')">View Details →</button>
            `;
            recommendedContainer.appendChild(item);
        });
    }
});
