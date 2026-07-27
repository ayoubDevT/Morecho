// ============ UI HELPER FUNCTIONS ============

function showAlert(message, type = 'info') {
    const alertElement = document.getElementById(`alert${type.charAt(0).toUpperCase() + type.slice(1)}`);
    alertElement.textContent = message;
    alertElement.classList.add('show');
    setTimeout(() => alertElement.classList.remove('show'), 3000);
}

function showLoader() {
    document.getElementById('loader').classList.add('active');
}

function hideLoader() {
    document.getElementById('loader').classList.remove('active');
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Close sidebar on mobile
    closeSidebar();

    // Load section-specific content
    switch(sectionId) {
        case 'myChallenges':
            loadChallenges();
            break;
        case 'community':
            loadPosts();
            loadQuestions();
            break;
        case 'blog':
            loadBlogPosts();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'askPlan':
            initializeCitySelector();
            break;
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
}

function toggleSubmenu(menuId) {
    const submenu = document.getElementById(menuId);
    submenu.classList.toggle('active');
}

function showTab(tabName) {
    document.getElementById('communityPosts').style.display = tabName === 'communityPosts' ? 'block' : 'none';
    document.getElementById('askLocals').style.display = tabName === 'askLocals' ? 'block' : 'none';
}

function initializeDashboard() {
    updateUserDisplay();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
}

document.addEventListener('DOMContentLoaded', function() {
    if (state.currentUser) {
        loadMainApp();
    }
});