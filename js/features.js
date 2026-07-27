// ============ MOR ECHO ADVANCED FEATURES ============

function icon(name) {
    const path = iconPaths[name] || iconPaths.home;
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function initializeAdvancedFeatures() {
    hydrateStaticIcons();
    renderDashboardStats();
    renderInteractiveMap();
    renderWorldCupMode();
    renderPassport();
    renderMarketplace();
    renderTransportAssistant();
    renderEmergency();
    renderAccessibilityPanel();
    renderAnalyticsDashboard();
    renderRecognitionPanel();
    renderRecommendations();
}

function hydrateStaticIcons() {
    document.querySelectorAll('[data-icon]').forEach(element => {
        element.innerHTML = icon(element.dataset.icon);
    });
}

function renderDashboardStats() {
    const container = document.getElementById('smartOverview');
    if (!container) return;

    container.innerHTML = [
        { label: 'AI routes', value: '24/7', icon: 'bot' },
        { label: 'Cities ready', value: cities.length, icon: 'map' },
        { label: 'Local experiences', value: experiences.length, icon: 'market' },
        { label: 'Eco score', value: `${state.passport.sustainableScore}%`, icon: 'shield' }
    ].map(item => `
        <div class="metric-card">
            ${icon(item.icon)}
            <div>
                <strong>${item.value}</strong>
                <span>${item.label}</span>
            </div>
        </div>
    `).join('');
}

function askAICompanion() {
    const input = document.getElementById('aiQuestion');
    const language = document.getElementById('aiLanguage').value;
    const output = document.getElementById('aiConversation');
    const question = input.value.trim();

    if (!question) {
        showAlert('Write a question for MorEcho AI.', 'error');
        return;
    }

    const answer = buildAIAnswer(question, language);
    output.innerHTML += `
        <div class="chat-bubble user">${escapeHTML(question)}</div>
        <div class="chat-bubble ai">${answer}</div>
    `;
    input.value = '';
    output.scrollTop = output.scrollHeight;
}

function buildAIAnswer(question, language) {
    const q = question.toLowerCase();
    const city = cities.find(name => q.includes(name.toLowerCase())) || 'Marrakech';
    const cityInfo = cityData[city];
    const langNote = {
        en: 'English response',
        fr: 'Reponse en francais',
        ar: 'Arabic-ready response',
        es: 'Respuesta en espanol',
        pt: 'Resposta em portugues'
    }[language];

    if (q.includes('emergency') || q.includes('hospital') || q.includes('police')) {
        return `<strong>${langNote}:</strong> Use Police 19 or Ambulance 15. Keep your location shared, contact your embassy for lost documents, and open the Emergency section for quick help.`;
    }

    if (q.includes('restaurant') || q.includes('food') || q.includes('halal')) {
        return `<strong>${langNote}:</strong> In ${city}, try ${cityInfo.restaurants[0].name} for ${cityInfo.restaurants[0].cuisine}. Most Moroccan restaurants are halal-friendly; confirm ingredients and ask for local specialties.`;
    }

    if (q.includes('budget') || q.includes('cheap') || q.includes('mad')) {
        return `<strong>${langNote}:</strong> For ${city}, choose medina walks, public transport, street food, and free landmarks. A smart daily budget can fit meals, transport and one paid attraction.`;
    }

    if (q.includes('history') || q.includes('culture') || q.includes('monument')) {
        return `<strong>${langNote}:</strong> Start with ${cityInfo.monuments[0].name}, then continue to ${cityInfo.monuments[1].name}. Add a local guide for context and respectful cultural etiquette.`;
    }

    return `<strong>${langNote}:</strong> I recommend ${city} for your request. Start in the ${cityInfo.bestTime.toLowerCase()}, visit ${cityInfo.monuments[0].name}, eat at ${cityInfo.restaurants[0].name}, and use ${cityInfo.transportation}.`;
}

function renderRecommendations() {
    const container = document.getElementById('recommendationPanel');
    if (!container) return;

    container.innerHTML = cities.slice(0, 4).map(city => `
        <div class="recommendation-card">
            <div class="pill">${cityData[city].code}</div>
            <h3>${city}</h3>
            <p>${cityData[city].description}</p>
            <span>${cityData[city].monuments[0].name}</span>
        </div>
    `).join('');
}

function renderInteractiveMap(filter = 'all') {
    const map = document.getElementById('moroccoMap');
    const list = document.getElementById('mapLocationList');
    if (!map || !list) return;

    const filtered = filter === 'all' ? mapLocations : mapLocations.filter(item => item.category === filter);
    map.innerHTML = filtered.map(location => `
        <button class="map-pin" style="left:${location.x}%; top:${location.y}%;" onclick="selectMapLocation(${location.id})" aria-label="${escapeHTML(location.name)}">
            ${icon('map')}
        </button>
    `).join('');

    list.innerHTML = filtered.map(location => locationCard(location)).join('');
}

function locationCard(location) {
    return `
        <div class="location-card">
            <div>
                <span class="pill">${escapeHTML(location.category)}</span>
                <h3>${escapeHTML(location.name)}</h3>
                <p>${escapeHTML(location.city)} - ${escapeHTML(location.desc)}</p>
            </div>
            <dl>
                <div><dt>Hours</dt><dd>${escapeHTML(location.hours)}</dd></div>
                <div><dt>Price</dt><dd>${escapeHTML(location.price)}</dd></div>
                <div><dt>Visit</dt><dd>${escapeHTML(location.duration)}</dd></div>
            </dl>
        </div>
    `;
}

function filterMap(category) {
    renderInteractiveMap(category);
}

function selectMapLocation(id) {
    const location = mapLocations.find(item => item.id === id);
    if (!location) return;
    document.getElementById('mapLocationList').innerHTML = locationCard(location);
}

function renderWorldCupMode() {
    const container = document.getElementById('worldCupCards');
    if (!container) return;

    container.innerHTML = worldCupData.map(item => `
        <div class="feature-card">
            ${icon('trophy')}
            <h3>${escapeHTML(item.city)}</h3>
            <p><strong>Stadium:</strong> ${escapeHTML(item.stadium)}</p>
            <p><strong>Fan zone:</strong> ${escapeHTML(item.fanZone)}</p>
            <p><strong>Transport:</strong> ${escapeHTML(item.transport)}</p>
            <p>${escapeHTML(item.tip)}</p>
        </div>
    `).join('');
}

function renderPassport() {
    const container = document.getElementById('passportPanel');
    if (!container) return;

    const stamps = cities.map(city => {
        const unlocked = state.passport.stamps.includes(city);
        return `<button class="stamp ${unlocked ? 'unlocked' : ''}" onclick="unlockStamp('${city}')">${cityData[city].code}<span>${city}</span></button>`;
    }).join('');

    container.innerHTML = `
        <div class="passport-cover">
            ${icon('passport')}
            <h3>Moroccan Digital Passport</h3>
            <p>${state.passport.xp} XP - Sustainable score ${state.passport.sustainableScore}%</p>
        </div>
        <div class="stamp-grid">${stamps}</div>
    `;
}

function unlockStamp(city) {
    if (!state.passport.stamps.includes(city)) {
        state.passport.stamps.push(city);
        state.passport.xp += 50;
        state.passport.sustainableScore = Math.min(100, state.passport.sustainableScore + 3);
        state.save();
        showAlert(`${city} stamp unlocked.`, 'success');
    }
    renderPassport();
    renderDashboardStats();
}

function renderMarketplace() {
    const container = document.getElementById('marketplaceGrid');
    if (!container) return;

    container.innerHTML = experiences.map(experience => `
        <div class="feature-card">
            ${icon('market')}
            <h3>${escapeHTML(experience.title)}</h3>
            <p>${escapeHTML(experience.city)} - ${escapeHTML(experience.duration)}</p>
            <p><strong>${escapeHTML(experience.price)}</strong></p>
            <p>${escapeHTML(experience.sustainability)}</p>
            <button class="btn btn-secondary" onclick="bookExperience(${experience.id})">Book experience</button>
        </div>
    `).join('');
}

function bookExperience(id) {
    const experience = experiences.find(item => item.id === id);
    if (!experience || !state.currentUser) return;

    state.bookings.push({
        id: Date.now(),
        userId: state.currentUser.id,
        experienceId: id,
        title: experience.title,
        createdAt: new Date().toISOString()
    });
    state.passport.xp += 25;
    state.passport.sustainableScore = Math.min(100, state.passport.sustainableScore + 2);
    state.save();
    showAlert('Experience booked and added to your passport.', 'success');
    renderPassport();
}

function renderTransportAssistant() {
    const container = document.getElementById('transportResult');
    if (!container) return;
    container.innerHTML = '<p class="muted">Choose a city and transport mode to estimate route, cost and sustainability.</p>';
}

function calculateTransport() {
    const city = document.getElementById('transportCity').value;
    const mode = document.getElementById('transportMode').value;
    const result = document.getElementById('transportResult');
    const cost = { walking: '0 MAD', tram: '6 MAD', bus: '5 MAD', train: '30-120 MAD', taxi: '20-80 MAD' }[mode];
    const time = { walking: '20-45 min', tram: '15-30 min', bus: '20-40 min', train: '1-3 hours', taxi: '10-25 min' }[mode];
    const score = { walking: 100, tram: 88, bus: 82, train: 76, taxi: 48 }[mode];

    result.innerHTML = `
        <div class="route-card">
            ${icon('route')}
            <h3>${escapeHTML(city)} route</h3>
            <p><strong>Mode:</strong> ${escapeHTML(mode)}</p>
            <p><strong>Estimated time:</strong> ${time}</p>
            <p><strong>Estimated cost:</strong> ${cost}</p>
            <p><strong>Sustainability:</strong> ${score}/100</p>
        </div>
    `;
}

function renderEmergency() {
    const container = document.getElementById('emergencyList');
    if (!container) return;

    container.innerHTML = emergencyContacts.map(contact => `
        <a class="emergency-card" href="tel:${contact.number.replace(/\s/g, '')}">
            ${icon('shield')}
            <div>
                <h3>${escapeHTML(contact.type)}</h3>
                <strong>${escapeHTML(contact.number)}</strong>
                <p>${escapeHTML(contact.note)}</p>
            </div>
        </a>
    `).join('');
}

function renderAccessibilityPanel() {
    applyAccessibilitySettings();
}

function toggleAccessibility(option) {
    document.body.classList.toggle(option);
    localStorage.setItem(option, document.body.classList.contains(option) ? '1' : '0');
}

function applyAccessibilitySettings() {
    ['high-contrast', 'large-text', 'reduced-motion'].forEach(option => {
        document.body.classList.toggle(option, localStorage.getItem(option) === '1');
    });
}

function renderRecognitionPanel() {
    const input = document.getElementById('imageHint');
    if (!input) return;
}

function analyzeImageHint() {
    const hint = document.getElementById('imageHint').value.toLowerCase();
    const output = document.getElementById('recognitionResult');
    const sample = recognitionSamples.find(item => hint.includes(item.keyword)) || recognitionSamples.find(item => item.keyword === 'default');

    state.passport.scannedItems.push({
        id: Date.now(),
        hint,
        result: sample.result,
        createdAt: new Date().toISOString()
    });
    state.passport.xp += 15;
    state.save();
    output.innerHTML = `<div class="feature-card">${icon('camera')}<h3>AI recognition result</h3><p>${escapeHTML(sample.result)}</p></div>`;
}

function renderAnalyticsDashboard() {
    const container = document.getElementById('analyticsGrid');
    if (!container) return;

    const values = [
        { label: 'Most visited city', value: 'Marrakech', icon: 'map' },
        { label: 'Popular category', value: 'Culture', icon: 'book' },
        { label: 'Bookings', value: state.bookings.length, icon: 'market' },
        { label: 'Eco indicator', value: `${state.passport.sustainableScore}%`, icon: 'shield' }
    ];

    container.innerHTML = values.map(item => `
        <div class="metric-card">
            ${icon(item.icon)}
            <div>
                <strong>${escapeHTML(item.value)}</strong>
                <span>${escapeHTML(item.label)}</span>
            </div>
        </div>
    `).join('');
}
