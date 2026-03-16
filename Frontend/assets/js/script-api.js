// ==================== API CONFIGURATION ==================== //

// Use relative URL so the app works on any host/port
const apiUrl = '/api';

// ==================== API CALLS ==================== //

/**
 * Fetch all universities from backend
 */
async function fetchUniversities(search = '', country = '') {
    try {
        let url = `${apiUrl}/universities`;
        const params = new URLSearchParams();
        
        if (search) params.append('search', search);
        if (country) params.append('country', country);
        
        if (params.toString()) url += '?' + params.toString();
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch universities');

        const result = await response.json();
        // API returns { success, count, data: [...] }
        return result.data || result;
    } catch (error) {
        console.error('Error fetching universities:', error);
        // Fallback to local data if API fails
        return universitiesData;
    }
}

/**
 * Fetch single university by ID
 */
async function fetchUniversity(id) {
    try {
        const response = await fetch(`${apiUrl}/universities/${id}`);
        if (!response.ok) throw new Error('Failed to fetch university');
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching university:', error);
        return null;
    }
}

/**
 * Fetch all programs with optional filters
 */
async function fetchPrograms(field = '', qualification = '', universityId = '') {
    try {
        let url = `${apiUrl}/programs`;
        const params = new URLSearchParams();
        
        if (field) params.append('field', field);
        if (qualification) params.append('qualification', qualification);
        if (universityId) params.append('university_id', universityId);
        
        if (params.toString()) url += '?' + params.toString();
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch programs');

        const result = await response.json();
        // API returns { success, count, data: [...] }
        return result.data || result;
    } catch (error) {
        console.error('Error fetching programs:', error);
        // Fallback to local data if API fails
        return programsData;
    }
}

/**
 * Fetch single program by ID
 */
async function fetchProgram(id) {
    try {
        const response = await fetch(`${apiUrl}/programs/${id}`);
        if (!response.ok) throw new Error('Failed to fetch program');
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching program:', error);
        return null;
    }
}

/**
 * Check eligibility via backend
 */
async function checkEligibilityAPI(subjects) {
    try {
        const response = await fetch(`${apiUrl}/check-eligibility`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subjects })
        });
        
        if (!response.ok) throw new Error('Failed to check eligibility');
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error checking eligibility:', error);
        return null;
    }
}

/**
 * Fetch all fields of study
 */
async function fetchFields() {
    try {
        const response = await fetch(`${apiUrl}/fields`);
        if (!response.ok) throw new Error('Failed to fetch fields');
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching fields:', error);
        return [];
    }
}

/**
 * Fetch all qualifications
 */
async function fetchQualifications() {
    try {
        const response = await fetch(`${apiUrl}/qualifications`);
        if (!response.ok) throw new Error('Failed to fetch qualifications');
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching qualifications:', error);
        return [];
    }
}

/**
 * Check backend health
 */
async function checkBackendHealth() {
    try {
        const response = await fetch(`${apiUrl}/health`);
        if (!response.ok) return false;
        
        const result = await response.json();
        return result.status === 'ok';
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
}

// ==================== FALLBACK DATA ==================== //

// Local data - used as fallback if API is unavailable
const universitiesData = [];
const programsData = [];
const gradePoints = {'A*': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0};

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
            <button type="button" class="btn-remove" onclick="removeSubject(this)"><i class="fas fa-times"></i> Remove</button>
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
    
    // Initialize pages
    initializePages();
});

// Process eligibility with backend
async function processEligibility() {
    const subjects = [];
    const subjectEntries = document.querySelectorAll('.subject-entry');

    // Collect subject data
    subjectEntries.forEach(entry => {
        const subject = entry.querySelector('.subject-select').value;
        const grade = entry.querySelector('.grade-select').value;
        if (subject && grade) {
            subjects.push({ subject, grade });
        }
    });

    if (subjects.length === 0) {
        alert('Please select at least one subject with a grade.');
        return;
    }

    // Show loading message
    const reportSection = document.getElementById('eligibilityReport');
    const programsList = document.getElementById('eligibleProgramsList');
    reportSection.style.display = 'block';
    programsList.innerHTML = '<li><i class="fas fa-spinner fa-spin"></i> Checking eligibility...</li>';

    // Call backend API
    const result = await checkEligibilityAPI(subjects);
    
    if (!result) {
        programsList.innerHTML = '<li style="color: var(--danger-color);"><i class="fas fa-exclamation-circle"></i> Error checking eligibility. Please try again.</li>';
        return;
    }

    displayEligibilityResults(result.eligible);
    reportSection.scrollIntoView({ behavior: 'smooth' });
}

// Display eligibility results
function displayEligibilityResults(programs) {
    const programsList = document.getElementById('eligibleProgramsList');
    programsList.innerHTML = '';

    if (programs.length === 0) {
        programsList.innerHTML = '<li><i class="fas fa-info-circle"></i> No programs match your qualifications. Please review the requirements.</li>';
    } else {
        programs.forEach(program => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong><i class="fas fa-check-circle" style="color: var(--success-color);"></i> ${program.name}</strong>
                <br><small><i class="fas fa-building"></i> ${program.university}</small>
            `;
            programsList.appendChild(li);
        });
    }
}

// ==================== FILTERS ==================== //

function applyFilters() {
    window.location.href = 'programs.html';
}

async function filterPrograms() {
    const field = document.getElementById('filterField')?.value;
    const qualification = document.getElementById('filterQual')?.value;

    const programs = await fetchPrograms(field, qualification);
    displayPrograms(programs);
}

function resetFilters() {
    document.getElementById('filterField').value = '';
    document.getElementById('filterQual').value = '';
    loadPrograms();
}

async function searchUniversities() {
    const searchTerm = document.getElementById('universitySearch').value;
    const universities = await fetchUniversities(searchTerm);
    displayUniversities(universities);
}

async function filterUniversities() {
    const country = document.getElementById('countryFilter').value;
    const universities = await fetchUniversities('', country);
    displayUniversities(universities);
}

// ==================== LOAD AND DISPLAY DATA ==================== //

async function loadPrograms() {
    const programs = await fetchPrograms();
    displayPrograms(programs);
}

function displayPrograms(programs) {
    const container = document.getElementById('programsList');
    container.innerHTML = '';

    if (programs.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999;"><i class="fas fa-inbox"></i> No programs found</div>';
        return;
    }

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

async function loadUniversities() {
    const universities = await fetchUniversities();
    displayUniversities(universities);
}

function displayUniversities(universities) {
    const container = document.getElementById('universitiesList');
    container.innerHTML = '';

    if (universities.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999; grid-column: 1/-1;"><i class="fas fa-inbox"></i> No universities found</div>';
        return;
    }

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
                <p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="https://${university.website}" target="_blank" style="color: var(--secondary-color);">${university.website}</a></p>
                <p><strong><i class="fas fa-book"></i> Programs:</strong> ${university.programs.length} programs</p>
            </div>
            <div class="university-card-footer">
                <button class="btn-map" onclick="showUniversityDetails('${university.id}')"><i class="fas fa-info-circle"></i> View Details</button>
                <button class="btn-view-details" onclick="window.open('https://${university.website}', '_blank')"><i class="fas fa-external-link-alt"></i> Visit Site</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==================== MODAL FUNCTIONS ==================== //

async function showProgramDetails(programId) {
    const program = await fetchProgram(programId);
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
                <strong><i class="fas fa-globe"></i> Website:</strong> <a href="https://${program.website}" target="_blank" style="color: var(--secondary-color);">${program.website}</a>
            </p>
        </div>
    `;

    modal.style.display = 'block';
}

async function showUniversityDetails(universityId) {
    const university = await fetchUniversity(universityId);
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
            <p><strong><i class="fas fa-map-marker-alt"></i> Location:</strong> ${university.location}</p>
            <p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="https://${university.website}" target="_blank" style="color: var(--secondary-color);">${university.website}</a></p>

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
}

// Initialize pages based on current page
function initializePages() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // programs.html and home.html manage their own initialization via DOMContentLoaded
    if (currentPage.includes('universities.html')) {
        loadUniversities();
    } else if (currentPage.includes('index.html') || currentPage === '') {
        loadRecommendedPrograms();
    }
    
    // Check backend health
    checkBackendHealth().then(isHealthy => {
        if (isHealthy) {
            console.log('✅ Backend is connected and running');
        } else {
            console.warn('⚠️ Backend is not available. Using fallback data.');
        }
    });
}

// Load recommended programs on home page
async function loadRecommendedPrograms() {
    const programs = await fetchPrograms();
    const recommendedContainer = document.getElementById('recommendedPrograms');
    
    if (recommendedContainer) {
        recommendedContainer.innerHTML = '';
        const topPrograms = programs.slice(0, 3);
        
        topPrograms.forEach(program => {
            const item = document.createElement('div');
            item.className = 'program-item';
            item.innerHTML = `
                <h4><i class="fas fa-graduation-cap"></i> ${program.name}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${program.university}</p>
                <button class="btn-details" onclick="showProgramDetails('${program.id}')"><i class="fas fa-arrow-right"></i> View Details</button>
            `;
            recommendedContainer.appendChild(item);
        });
    }
}
