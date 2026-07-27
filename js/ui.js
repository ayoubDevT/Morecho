// ============ UI HELPER FUNCTIONS ============

function showAlert(message, type = 'info') {
    const alertElement = document.getElementById(`alert${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (!alertElement) return;
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
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.classList.add('active');

    document.querySelectorAll('.sidebar-menu .active').forEach(item => item.classList.remove('active'));
    document.querySelectorAll(`.sidebar-menu [onclick*="${sectionId}"]`).forEach(item => item.classList.add('active'));

    // Close sidebar on mobile
    closeSidebar();
    closeSubmenus();

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
        case 'aiCompanion':
            renderRecommendations();
            break;
        case 'map':
            renderInteractiveMap();
            break;
        case 'worldCup':
            renderWorldCupMode();
            break;
        case 'passport':
            renderPassport();
            break;
        case 'marketplace':
            renderMarketplace();
            break;
        case 'transport':
            renderTransportAssistant();
            break;
        case 'emergency':
            renderEmergency();
            break;
        case 'accessibility':
            renderAccessibilityPanel();
            break;
        case 'recognition':
            renderRecognitionPanel();
            break;
        case 'analytics':
            renderAnalyticsDashboard();
            break;
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
}

function closeSubmenus() {
    document.querySelectorAll('.submenu.active').forEach(submenu => submenu.classList.remove('active'));
}

function toggleSubmenu(menuId) {
    const submenu = document.getElementById(menuId);
    submenu.classList.toggle('active');
}

function showTab(tabName) {
    document.getElementById('communityPosts').style.display = tabName === 'communityPosts' ? 'block' : 'none';
    document.getElementById('askLocals').style.display = tabName === 'askLocals' ? 'block' : 'none';
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
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

