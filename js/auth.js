// ============ AUTHENTICATION FUNCTIONS ============

let chatInitialized = false;

function initializeChatWidget() {
    if (chatInitialized) return;

    import('https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js')
        .then(module => {
            module.createChat({
                webhookUrl: 'https://ayouby.app.n8n.cloud/webhook/24910f31-ab95-44a9-b510-1204b73a4c3f/chat',
                mode: 'window',
                showWelcomeScreen: false,
                initialMessages: [
                    'Hi there! 👋 My name is Morecho.',
                    'I am your Morocco 2030 FIFA World Cup travel guide.',
                    'Which host city would you like to explore today? 🇲🇦'
                ],
                i18n: {
                    en: {
                        title: 'Morocco 2030 Guide 🇲🇦',
                        subtitle: 'Your FIFA World Cup travel companion',
                        inputPlaceholder: 'Ask about Marrakech, Rabat, Fes, Casablanca, Tangier or Agadir...',
                        getStarted: 'Start Planning',
                        closeButtonTooltip: 'Close chat',
                    }
                }
            });
            chatInitialized = true;
        })
        .catch(error => {
            console.error('Failed to initialize chat widget:', error);
        });
}

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const title = document.getElementById('authTitle');

    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
    title.textContent = title.textContent === 'Login' ? 'Register' : 'Login';
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    const user = state.users.find(u => u.email === email && u.password === password);

    if (user) {
        state.currentUser = user;
        state.saveCurrentUser();
        showAlert('Login successful!', 'success');
        setTimeout(() => loadMainApp(), 500);
    } else {
        showAlert('Invalid email or password', 'error');
    }
}

function handleRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();

    if (!name || !email || !password) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }

    if (state.users.find(u => u.email === email)) {
        showAlert('Email already registered', 'error');
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        phone,
        bio: '',
        location: '',
        avatar: name.charAt(0).toUpperCase(),
        score: state.passport.score || 120,
        createdAt: new Date().toISOString()
    };

    state.users.push(newUser);
    state.save();

    showAlert('Registration successful! Please login.', 'success');
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerPhone').value = '';
    
    setTimeout(() => toggleAuthForm(), 1500);
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        state.currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('mainContainer').classList.remove('active');
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('sidebar').classList.remove('active');
        document.body.classList.add('auth-screen');
        showAlert('Logged out successfully', 'info');
    }
}

function loadMainApp() {
    document.body.classList.remove('auth-screen');
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('mainContainer').classList.add('active');
    updateUserDisplay();
    initializeDashboard();
    if (typeof initializeAdvancedFeatures === 'function') {
        initializeAdvancedFeatures();
    }
    initializeChatWidget();
}

function updateUserDisplay() {
    if (state.currentUser) {
        const avatar = state.currentUser.name.charAt(0).toUpperCase();
        document.getElementById('userAvatarHeader').textContent = avatar;
        document.getElementById('profileAvatar').textContent = avatar;
    }
}
