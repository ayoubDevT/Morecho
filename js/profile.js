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
    const passportCities = state.passport?.stamps || [];
    const citiesVisited = new Set([...userChallenges.map(c => c.city), ...passportCities]).size;

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
    const completedCount = userChallenges.filter(c => c.status === 'completed').length;
    const activeCount = userChallenges.filter(c => c.status !== 'completed').length;
    const activeTemplateIds = userChallenges.filter(c => c.status !== 'completed').map(c => c.templateId).filter(Boolean);
    const availableChallenges = challengeTemplates.filter(template => !activeTemplateIds.includes(template.id));

    challengesList.innerHTML = `
        <div class="game-dashboard">
            <div class="game-score-card">
                <span>Score</span>
                <strong>${state.passport.score}</strong>
                <p>Level ${state.passport.level} traveler</p>
            </div>
            <div class="game-score-card">
                <span>Completed</span>
                <strong>${completedCount}</strong>
                <p>${activeCount} active mission${activeCount === 1 ? '' : 's'}</p>
            </div>
            <div class="game-score-card">
                <span>Badges</span>
                <strong>${state.passport.badges.length}</strong>
                <p>${getNextBadgeHint()}</p>
            </div>
        </div>

        <h3 class="section-title">Choose a challenge</h3>
        <div class="challenge-catalog">
            ${availableChallenges.map(template => challengeTemplateCard(template)).join('') || '<p class="muted">All challenge types are already active. Complete one to unlock it again.</p>'}
        </div>

        <h3 class="section-title">Your active journey</h3>
        ${userChallenges.length === 0 ? `
            <div class="challenge-card empty-game-state">
                <h4>No active challenges yet</h4>
                <p>Choose a challenge above or generate a smart plan to start collecting points.</p>
                <button class="btn btn-primary" onclick="showSection('askPlan')">Generate a plan challenge</button>
            </div>
        ` : userChallenges.map(challenge => challengeProgressCard(challenge)).join('')}
    `;
}

function challengeTemplateCard(template) {
    return `
        <div class="challenge-card challenge-template">
            <div class="challenge-cover" style="--photo: ${cityData[template.city]?.photo};"></div>
            <div class="challenge-card-head">
                <div>
                    <span class="pill">${escapeHTML(template.category)}</span>
                    <h4>${escapeHTML(template.title)}</h4>
                    <p>${escapeHTML(template.city)} - ${escapeHTML(template.points)} points</p>
                </div>
                <div class="badge-token">${escapeHTML(template.badge)}</div>
            </div>
            <ol class="challenge-steps">
                ${template.steps.map(step => `<li>${escapeHTML(step)}</li>`).join('')}
            </ol>
            <button class="btn btn-secondary" onclick="startChallenge('${template.id}')">Start challenge</button>
        </div>
    `;
}

function challengeProgressCard(challenge) {
        const statusClass = challenge.status === 'completed' ? 'completed' : 'pending';
        const statusText = challenge.status === 'completed' ? 'Completed' : 'Photo proof needed';
        const city = challenge.city || 'Morocco';
        const title = challenge.title || `${city} Day Plan`;
        const points = challenge.points || 80;
        const badge = challenge.badge || `${city} Explorer`;
        const proofInputId = `proof-${challenge.id}`;
        const actionButton = challenge.status === 'completed'
            ? `<div class="proof-preview">${challenge.proofImage ? `<img src="${challenge.proofImage}" alt="Challenge proof">` : ''}<p>Reward claimed: ${points} points</p></div>`
            : `
                <div class="proof-uploader">
                    <label for="${proofInputId}">Upload photo proof</label>
                    <input id="${proofInputId}" type="file" accept="image/*" capture="environment">
                    <textarea id="note-${challenge.id}" placeholder="What did you discover?"></textarea>
                    <button class="btn btn-secondary" onclick="submitChallengeProof(${challenge.id}, '${proofInputId}')">Submit proof and claim points</button>
                </div>
            `;

        return `
            <div class="challenge-card">
                <div class="challenge-cover" style="--photo: ${cityData[city]?.photo || cityData.Marrakech.photo};"></div>
                <div class="challenge-card-head">
                    <div>
                        <span class="pill">${escapeHTML(challenge.category || 'Plan')}</span>
                        <h4>${escapeHTML(title)}</h4>
                        <p>${escapeHTML(city)} - ${points} points - Badge: ${escapeHTML(badge)}</p>
                        <p class="muted">Created ${formatDate(challenge.createdAt)}</p>
                    </div>
                    <span class="challenge-status ${statusClass}">${statusText}</span>
                </div>
                <p>${escapeHTML(challenge.evidence || 'Take a photo that proves you completed this travel plan.')}</p>
                ${actionButton}
            </div>
        `;
}

function startChallenge(templateId) {
    if (!state.currentUser) {
        showAlert('Please login first', 'error');
        return;
    }

    const template = challengeTemplates.find(item => item.id === templateId);
    if (!template) return;

    state.challenges.push({
        id: Date.now(),
        templateId: template.id,
        userId: state.currentUser.id,
        city: template.city,
        title: template.title,
        category: template.category,
        points: template.points,
        badge: template.badge,
        evidence: template.evidence,
        steps: template.steps,
        type: 'photo_challenge',
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null,
        proofImage: '',
        proofNote: ''
    });

    state.save();
    showAlert(`${template.title} started. Take a photo to claim points.`, 'success');
    loadChallenges();
}

function completeChallenge(challengeId) {
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (challenge) {
        awardChallenge(challenge, '');
    }
}

function submitChallengeProof(challengeId, inputId) {
    const challenge = state.challenges.find(c => c.id === challengeId);
    const input = document.getElementById(inputId);
    const note = document.getElementById(`note-${challengeId}`)?.value.trim() || '';

    if (!challenge || !input || !input.files || input.files.length === 0) {
        showAlert('Please upload a photo as proof first.', 'error');
        return;
    }

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
        showAlert('Please choose an image file.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => awardChallenge(challenge, reader.result, note);
    reader.onerror = () => showAlert('Could not read this photo. Try another image.', 'error');
    reader.readAsDataURL(file);
}

function awardChallenge(challenge, proofImage, proofNote = '') {
    if (challenge.status === 'completed') {
        showAlert('This challenge is already completed.', 'info');
        return;
    }

    const points = challenge.points || 80;
    challenge.status = 'completed';
    challenge.completedAt = new Date().toISOString();
    challenge.proofImage = proofImage;
    challenge.proofNote = proofNote;

    state.passport.score += points;
    state.passport.xp += points;
    state.passport.level = Math.max(1, Math.floor(state.passport.score / 250) + 1);
    state.passport.sustainableScore = Math.min(100, state.passport.sustainableScore + 2);
    state.passport.completedChallengeIds.push(challenge.id);

    unlockBadge(challenge.badge || `${challenge.city} Explorer`, `Completed ${challenge.title || `${challenge.city} challenge`}.`);
    applyBadgeRules();

    if (challenge.city && !state.passport.stamps.includes(challenge.city)) {
        state.passport.stamps.push(challenge.city);
    }

    state.save();
    showAlert(`Challenge completed! +${points} points`, 'success');
    loadChallenges();
    loadProfile();
    renderPassport();
    renderDashboardStats();
}

function unlockBadge(title, description) {
    if (!title || state.passport.badges.some(badge => badge.title === title)) return;

    state.passport.badges.push({
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        description,
        earnedAt: new Date().toISOString()
    });
}

function applyBadgeRules() {
    const completedCount = state.challenges.filter(c => c.userId === state.currentUser?.id && c.status === 'completed').length;

    badgeRules.forEach(rule => {
        const meetsCompleted = !rule.minCompleted || completedCount >= rule.minCompleted;
        const meetsScore = !rule.minScore || state.passport.score >= rule.minScore;
        if (meetsCompleted && meetsScore) {
            unlockBadge(rule.title, rule.description);
        }
    });
}

function getNextBadgeHint() {
    const completedCount = state.challenges.filter(c => c.userId === state.currentUser?.id && c.status === 'completed').length;
    const nextRule = badgeRules.find(rule => {
        const hasBadge = state.passport.badges.some(badge => badge.title === rule.title);
        if (hasBadge) return false;
        if (rule.minCompleted) return completedCount < rule.minCompleted;
        if (rule.minScore) return state.passport.score < rule.minScore;
        return false;
    });

    if (!nextRule) return 'All core badges unlocked';
    if (nextRule.minCompleted) return `${nextRule.minCompleted - completedCount} more completions`;
    return `${nextRule.minScore - state.passport.score} more points`;
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
