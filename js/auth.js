// ============ AUTHENTICATION FUNCTIONS ============

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

function getDefaultJournalPostsForUser(user) {
    const now = new Date().toISOString();
    return [
        {
            id: Date.now() + 1,
            userId: user.id,
            author: user.name,
            avatar: user.avatar,
            title: 'Bienvenue dans ton journal de voyage',
            content: 'Commence ici ton carnet de bord avec tes premières impressions du Maroc. Note tes découvertes, tes adresses préférées, et ce que tu veux absolument visiter ensuite.',
            city: 'Marrakech',
            imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jamaa%20El%20Fna%20%28Marrakesch%2C%20Marokko%29%2001.jpg?width=1200',
            type: 'blog',
            likes: 0,
            views: 0,
            comments: [],
            createdAt: now
        },
        {
            id: Date.now() + 2,
            userId: user.id,
            author: user.name,
            avatar: user.avatar,
            title: 'Mes astuces locales et bons plans',
            content: 'Rédige une liste de bons plans locaux : cafés à ne pas manquer, transports faciles et conseils de sécurité pendant ton voyage.',
            city: 'Fès',
            imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bab%20Bou%20Jeloud%20Frame%20Minaret%20Fes%20Nov25%20A7CR%2009127-8%20HDR3.jpg?width=1200',
            type: 'blog',
            likes: 0,
            views: 0,
            comments: [],
            createdAt: now
        },
    ];
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
    state.blogPosts = state.blogPosts.concat(getDefaultJournalPostsForUser(newUser));
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
        showAlert('Logged out successfully', 'info');
    }
}

function loadMainApp() {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('mainContainer').classList.add('active');
    updateUserDisplay();
    initializeDashboard();
    if (typeof initializeAdvancedFeatures === 'function') {
        initializeAdvancedFeatures();
    }
}

function updateUserDisplay() {
    if (state.currentUser) {
        const avatar = state.currentUser.name.charAt(0).toUpperCase();
        document.getElementById('userAvatarHeader').textContent = avatar;
        document.getElementById('profileAvatar').textContent = avatar;
    }
}
