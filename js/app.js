// ============ MAIN APPLICATION INITIALIZATION ============

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is already logged in
    if (state.currentUser) {
        loadMainApp();
    } else {
        document.getElementById('authContainer').classList.remove('hidden');
    }
}

function setupEventListeners() {
    // Enter key on login form
    document.getElementById('loginEmail').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });

    document.getElementById('loginPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });

    // Enter key on register form
    document.getElementById('registerPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleRegister();
    });

    // Close sidebar on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            closeSidebar();
        }
    });

    // Initialize city selector when asking for a plan
    const askPlanSection = document.getElementById('askPlan');
    if (askPlanSection) {
        const observer = new MutationObserver(function(mutations) {
            if (askPlanSection.classList.contains('active')) {
                initializeCitySelector();
            }
        });

        observer.observe(askPlanSection, { attributes: true });
    }
}

// ============ RESPONSIVE NAVIGATION ============

window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
});

// ============ LOCAL STORAGE AUTO-SAVE ============

setInterval(function() {
    if (state.currentUser) {
        state.save();
        state.saveCurrentUser();
    }
}, 30000); // Auto-save every 30 seconds

// ============ DEMO DATA INITIALIZATION ============

function initializeDemoData() {
    // Only initialize if no users exist
    if (state.users.length === 0) {
        const demoUsers = [
            {
                id: 1,
                name: 'Ahmed Hassan',
                email: 'ahmed@example.com',
                password: 'password123',
                phone: '+212612345678',
                bio: 'Travel enthusiast from Marrakech',
                location: 'Marrakech, Morocco',
                avatar: 'A',
                isLocal: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                password: 'password123',
                phone: '+1234567890',
                bio: 'Exploring Morocco',
                location: 'New York, USA',
                avatar: 'S',
                isLocal: false,
                createdAt: new Date().toISOString()
            }
        ];

        const demoPosts = [
            {
                id: 101,
                userId: 1,
                author: 'Ahmed Hassan',
                avatar: 'A',
                content: 'Just finished exploring the Koutoubia Mosque. Amazing architecture! 🕌',
                type: 'post',
                likes: 5,
                comments: [],
                createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 102,
                userId: 2,
                author: 'Sarah Johnson',
                avatar: 'S',
                content: 'The food in Casablanca is incredible. Already planning my next trip! 🍽️',
                type: 'post',
                likes: 8,
                comments: [],
                createdAt: new Date(Date.now() - 7200000).toISOString()
            }
        ];

        state.users = demoUsers;
        state.posts = demoPosts;
        state.save();
    }
}

// Initialize demo data on first load
if (state.users.length === 0) {
    initializeDemoData();
}

// ============ DEBUGGING HELPERS ============

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}

function exportUserData() {
    const userData = {
        user: state.currentUser,
        posts: state.posts.filter(p => p.userId === state.currentUser.id),
        challenges: state.challenges.filter(c => c.userId === state.currentUser.id),
        blogs: state.blogPosts.filter(b => b.userId === state.currentUser.id)
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-data-${Date.now()}.json`;
    link.click();
    showAlert('Data exported successfully!', 'success');
}

// ============ SERVICE WORKER REGISTRATION (for PWA features) ============

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('Service Worker registration failed:', error);
    });
}