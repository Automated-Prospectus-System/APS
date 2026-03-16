/**
 * Authentication Manager
 * Handles user login, session management, and page protection
 */

const AuthManager = {
    // Valid credentials (in production, use backend authentication)
    credentials: {
        admin: 'admin123',
        user: 'password123',
        student: 'student123'
    },

    // University data with real logos
    universities: [
        {
            id: 1,
            name: 'National University of Lesotho',
            shortName: 'NUL',
            city: 'Roma',
            icon: 'fa-building',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/National_University_of_Lesotho_logo.svg/1200px-National_University_of_Lesotho_logo.svg.png',
            website: 'https://nul.ls/',
            email: 'admin@nul.ls',
            phone: '+266 2201 2233',
            description: 'The premier public university in Lesotho with multiple faculties and research centers',
            color: '#003d7a'
        },
        {
            id: 2,
            name: 'Lerotholi Polytechnic',
            shortName: 'LP',
            city: 'Maseru',
            icon: 'fa-hammer',
            logo: 'https://www.lp.ac.ls/wp-content/uploads/2019/01/logo1.png',
            website: 'https://www.lp.ac.ls/',
            email: 'admissions@lp.ac.ls',
            phone: '+266 2231 2000',
            description: 'Leading polytechnic offering vocational and technical programmes',
            color: '#ff6b35'
        },
        {
            id: 3,
            name: 'Lesotho College of Education',
            shortName: 'LCE',
            city: 'Maseru',
            icon: 'fa-graduation-cap',
            logo: 'https://www.lce.ac.ls/wp-content/uploads/2020/09/LCE-Logo-Final.png',
            website: 'http://www.lce.ac.ls/',
            email: 'info@lce.ac.ls',
            phone: '+266 2231 3200',
            description: 'Premier teacher education institution in Lesotho',
            color: '#04a777'
        },
        {
            id: 4,
            name: 'Botho University Lesotho',
            shortName: 'BU',
            city: 'Maseru',
            icon: 'fa-university',
            logo: 'https://lesotho.bothouniversity.com/wp-content/uploads/sites/4/2022/08/logo-300x300.png',
            website: 'https://lesotho.bothouniversity.com/',
            email: 'admissions@botho.ls',
            phone: '+266 2231 3300',
            description: 'Private university offering business and technology programmes',
            color: '#1f4788'
        },
        {
            id: 5,
            name: 'Limkokwing University of Creative Technology',
            shortName: 'LUCT',
            city: 'Maseru',
            icon: 'fa-palette',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Limkokwing_University_of_Creative_Technology_logo.svg/1200px-Limkokwing_University_of_Creative_Technology_logo.svg.png',
            website: 'https://www.limkokwing.net/lesotho/',
            email: 'lesotho@limkokwing.net',
            phone: '+266 2231 2800',
            description: 'Specialized institution for creative technology and design programmes',
            color: '#e74c3c'
        },
        {
            id: 6,
            name: 'African University College of Communications',
            shortName: 'AUC',
            city: 'Maseru',
            icon: 'fa-microphone',
            logo: 'https://www.aucc.ac.ls/wp-content/uploads/2021/03/aucc-logo-300x300.png',
            website: 'https://www.aucc.ac.ls/',
            email: 'admissions@aucc.ac.ls',
            phone: '+266 2223 1000',
            description: 'Specialist institution in communications, media, and journalism',
            color: '#8e44ad'
        }
    ],

    /**
     * Login user
     */
    login(username, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.credentials[username] === password) {
                    // Store in sessionStorage
                    sessionStorage.setItem('isAuthenticated', 'true');
                    sessionStorage.setItem('currentUser', username);
                    sessionStorage.setItem('loginTime', new Date().toISOString());
                    
                    // Store in localStorage if "Remember me" is checked
                    const rememberMe = document.querySelector('input[name=\"remember\"]')?.checked;
                    if (rememberMe) {
                        localStorage.setItem('rememberUser', username);
                    }
                    
                    resolve({ success: true, user: username });
                } else {
                    resolve({ success: false, error: 'Invalid username or password' });
                }
            }, 500);
        });
    },

    /**
     * Logout user
     */
    logout() {
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('loginTime');
        window.location.href = 'login.html';
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return sessionStorage.getItem('isAuthenticated') === 'true';
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        return sessionStorage.getItem('currentUser') || 'Guest';
    },

    /**
     * Get all universities
     */
    getUniversities() {
        return this.universities;
    },

    /**
     * Get university by ID
     */
    getUniversity(id) {
        return this.universities.find(u => u.id === parseInt(id));
    }
};

/**
 * Protect page - redirect to login if not authenticated
 */
function protectPage() {
    if (!AuthManager.isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

/**
 * Handle login form submission
 */
document.addEventListener('DOMContentLoaded', () => {
    // Auto-login if already authenticated
    if (AuthManager.isAuthenticated()) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage === 'login.html') {
            window.location.href = 'home.html';
        }
    }
});
