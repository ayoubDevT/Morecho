// ============ PROFILE FUNCTIONS ============

function loadProfile() {
    if (!state.currentUser) {
        showAlert('Please login first', 'error');
        return;
    }

    const user = state.currentUser;
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileAvatar').textContent = user.avatar;

    // Populate edit form
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editBio').value = user.bio || '';
    document.getElementById('editLocation').value = user.location || '';

    // Calculate stats
    const userPosts = state.posts.filter(p => p.userId === user.id);
    const userChallenges = state.challenges.filter(c => c.userId === user.id);
    const userBlogs = state.blogPosts.filter(b => b.userId === user.id);
    
    const totalPosts = userPosts.length + userBlogs.length;
    const completedChallenges = userChallenges.filter(c => c.status === 'completed').length;
    const citiesVisited = new Set(userChallenges.map(c => c.city)).size;

    document.getElementById('statPosts').textContent = totalPosts;
    document.getElementById('statChallenges').textContent = completedChallenges;
    document.getElementById('statCities').textContent = citiesVisited;
}

function saveProfile() {
    if (!state.currentUser) {
        showAlert('Please login first', 'error');
        return;
    }

    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const location = document.getElementById('editLocation').value.trim();

    if (!name) {
        showAlert('Name cannot be empty', 'error');
        return;
    }

    // Update in state
    state.currentUser.name = name;
    state.currentUser.phone = phone;
    state.currentUser.bio = bio;
    state.currentUser.location = location;
    state.currentUser.avatar = name.charAt(0).toUpperCase();

    // Update in users array
    const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
    if (userIndex !== -1) {
        state.users[userIndex] = state.currentUser;
    }

    state.save();
    state.saveCurrentUser();
    
    updateUserDisplay();
    loadProfile();
    showAlert('Profile updated successfully!', 'success');
}

function loadChallenges() {
    if (!state.currentUser) {
        showAlert('Please login first', 'error');
        return;
    }

    const userChallenges = state.challenges.filter(c => c.userId === state.currentUser.id);
    const challengesList = document.getElementById('challengesList');

    if (userChallenges.length === 0) {
        challengesList.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: var(--text-light); margin-bottom: 20px;">
                    No challenges yet. <a onclick="showSection('askPlan')" style="color: var(--primary-color); cursor: pointer;">Ask for a plan</a> to start your journey!
                </p>
            </div>
        `;
        return;
    }

    challengesList.innerHTML = userChallenges.map(challenge => {
        const statusClass = challenge.status === 'completed' ? 'completed' : 'pending';
        const statusText = challenge.status === 'completed' ? '✓ Completed' : '⏳ Pending';
        const city = challenge.city;

        return `
            <div class="challenge-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4>🏙️ ${city} Day Plan</h4>
                        <p style="color: var(--text-light); margin-bottom: 10px;">
                            Created ${formatDate(challenge.createdAt)}
                        </p>
                    </div>
                    <span class="challenge-status ${statusClass}">${statusText}</span>
                </div>
                <div style="margin-top: 15px;">
                    <button class="btn btn-secondary" style="width: 100%;" onclick="completeChallenge(${challenge.id})">
                        Mark as Completed
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function completeChallenge(challengeId) {
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (challenge) {
        challenge.status = 'completed';
        challenge.completedAt = new Date().toISOString();
        state.save();
        showAlert('Challenge completed! 🎉', 'success');
        loadChallenges();
        loadProfile();
    }
}

function editProfileInfo() {
    showSection('profile');
    loadProfile();
}

function changePassword() {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    if (currentPassword !== state.currentUser.password) {
        showAlert('Current password is incorrect', 'error');
        return;
    }

    const newPassword = prompt('Enter your new password:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirm your new password:');
    if (confirmPassword !== newPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }

    state.currentUser.password = newPassword;
    const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
    if (userIndex !== -1) {
        state.users[userIndex].password = newPassword;
    }

    state.save();
    state.saveCurrentUser();
    showAlert('Password changed successfully!', 'success');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        const password = prompt('Enter your password to confirm:');
        if (password === state.currentUser.password) {
            const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
            if (userIndex !== -1) {
                state.users.splice(userIndex, 1);
            }

            // Delete user's content
            state.posts = state.posts.filter(p => p.userId !== state.currentUser.id);
            state.challenges = state.challenges.filter(c => c.userId !== state.currentUser.id);
            state.questions = state.questions.filter(q => q.userId !== state.currentUser.id);
            state.blogPosts = state.blogPosts.filter(b => b.userId !== state.currentUser.id);

            state.save();
            showAlert('Account deleted', 'info');
            handleLogout();
        } else {
            showAlert('Incorrect password', 'error');
        }
    }
}