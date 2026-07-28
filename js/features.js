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
        { label: 'Traveler score', value: state.passport.score, icon: 'trophy' },
        { label: 'Cities ready', value: cities.length, icon: 'map' },
        { label: 'Badges earned', value: state.passport.badges.length, icon: 'passport' },
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
            <div class="recommendation-media" style="--photo: ${cityData[city].photo};">
                <span class="pill">${cityData[city].code}</span>
            </div>
            <div class="recommendation-body">
                <h3>${city}</h3>
                <p>${cityData[city].description}</p>
                <span>${cityData[city].monuments[0].name}</span>
            </div>
        </div>
    `).join('');
}

let morEchoLeafletMap = null;
let morEchoLeafletMarkers = [];

function renderInteractiveMap(filter = 'all') {
    const map = document.getElementById('moroccoMap');
    const list = document.getElementById('mapLocationList');
    if (!map || !list) return;

    state.currentMapFilter = filter;
    const filtered = filter === 'all' ? mapLocations : mapLocations.filter(item => item.category === filter);

    if (window.L && map.offsetParent !== null) {
        renderLeafletMap(map, filtered);
    } else {
        renderStaticMap(map, filtered);
    }

    renderMapLocationList(list, filtered);
}

function renderStaticMap(map, filtered) {
    map.classList.remove('real-map');
    map.innerHTML = `
        ${renderMapRoads(filtered)}
        ${filtered.map(location => `
        <button class="map-pin ${location.category.toLowerCase()} ${location.id === state.selectedMapLocationId ? 'active' : ''}" style="left:${location.x}%; top:${location.y}%;" onclick="selectMapLocation(${location.id})" aria-label="${escapeHTML(location.name)}">
            ${icon('map')}
        </button>
        <span class="map-city-label" style="left:${location.x}%; top:${location.y}%;">${escapeHTML(location.city)}</span>
        `).join('')}
    `;
}

function renderMapLocationList(list, filtered) {
    list.innerHTML = (state.selectedMapLocationId
        ? filtered.filter(location => location.id === state.selectedMapLocationId)
        : filtered
    ).map(location => locationCard(location)).join('');
}

function renderLeafletMap(mapElement, filtered) {
    mapElement.classList.add('real-map');

    if (!morEchoLeafletMap) {
        mapElement.innerHTML = '';
        morEchoLeafletMap = L.map(mapElement, {
            zoomControl: true,
            scrollWheelZoom: false
        }).setView([31.9, -6.2], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(morEchoLeafletMap);
    }

    morEchoLeafletMarkers.forEach(marker => marker.remove());
    morEchoLeafletMarkers = filtered.map(location => {
        const marker = L.marker([location.lat, location.lng], {
            icon: L.divIcon({
                className: '',
                html: `<span class="leaflet-morocco-pin ${location.category.toLowerCase()} ${location.id === state.selectedMapLocationId ? 'active' : ''}">${icon('map')}</span>`,
                iconSize: [38, 38],
                iconAnchor: [19, 32],
                popupAnchor: [0, -30]
            })
        }).addTo(morEchoLeafletMap);

        marker.bindPopup(`
            <strong>${escapeHTML(location.name)}</strong><br>
            ${escapeHTML(location.city)} - ${escapeHTML(location.category)}<br>
            ${escapeHTML(location.hours)}
        `);
        marker.on('click', () => selectMapLocation(location.id));
        return marker;
    });

    const selected = filtered.find(location => location.id === state.selectedMapLocationId);
    if (selected) {
        morEchoLeafletMap.setView([selected.lat, selected.lng], 12, { animate: true });
    } else if (filtered.length) {
        morEchoLeafletMap.fitBounds(filtered.map(location => [location.lat, location.lng]), {
            padding: [32, 32],
            maxZoom: 7
        });
    }

    setTimeout(() => morEchoLeafletMap.invalidateSize(), 0);
}

function locationCard(location) {
    return `
        <div class="location-card" onclick="selectMapLocation(${location.id})">
            <div class="location-photo" style="--photo: ${location.photo};"></div>
            <div class="location-body">
                <span class="pill">${escapeHTML(location.category)}</span>
                <h3>${escapeHTML(location.name)}</h3>
                <p>${escapeHTML(location.city)} - ${escapeHTML(location.desc)}</p>
                <div class="location-meta">
                    <span>${escapeHTML(location.rating)} rating</span>
                    <span>${location.accessible ? 'Wheelchair notes' : 'Limited access'}</span>
                    <span>${escapeHTML(location.distance)}</span>
                </div>
            <dl>
                <div><dt>Hours</dt><dd>${escapeHTML(location.hours)}</dd></div>
                <div><dt>Price</dt><dd>${escapeHTML(location.price)}</dd></div>
                <div><dt>Visit</dt><dd>${escapeHTML(location.duration)}</dd></div>
                <div><dt>Nearby</dt><dd>${escapeHTML(location.nearby)}</dd></div>
            </dl>
            <a class="image-credit" href="https://commons.wikimedia.org/" target="_blank" rel="noopener">Image: Wikimedia Commons</a>
            </div>
        </div>
    `;
}

function filterMap(category) {
    state.selectedMapLocationId = null;
    renderInteractiveMap(category);
}

function selectMapLocation(id) {
    const location = mapLocations.find(item => item.id === id);
    if (!location) return;
    state.selectedMapLocationId = id;
    renderInteractiveMap(state.currentMapFilter || 'all');
    document.getElementById('mapLocationList').innerHTML = locationCard(location);
}

function renderMapRoads(locations) {
    const cityPoints = {};
    locations.forEach(location => {
        cityPoints[location.city] = location;
    });

    const roads = [
        ['Tangier', 'Rabat', 'main'],
        ['Rabat', 'Casablanca', 'main'],
        ['Casablanca', 'Marrakech', 'main'],
        ['Marrakech', 'Agadir', 'secondary'],
        ['Rabat', 'Fes', 'secondary']
    ];

    return roads.map(([from, to, type]) => {
        const start = cityPoints[from] || mapLocations.find(location => location.city === from);
        const end = cityPoints[to] || mapLocations.find(location => location.city === to);
        if (!start || !end) return '';
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt((dx * dx) + (dy * dy));
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return `<span class="map-road ${type === 'main' ? 'main' : ''}" style="left:${start.x}%; top:${start.y}%; width:${length}%; transform: rotate(${angle}deg);"></span>`;
    }).join('');
}

function renderWorldCupMode() {
    const container = document.getElementById('worldCupCards');
    if (!container) return;

    container.innerHTML = worldCupData.map(item => `
        <div class="feature-card worldcup-card">
            ${item.photo ? `<div class="post-image"><img src="${escapeHTML(item.photo)}" alt="${escapeHTML(item.stadium)}"></div>` : ''}
            ${icon('trophy')}
            <h3>${escapeHTML(item.city)}</h3>
            <p><strong>Stadium:</strong> ${escapeHTML(item.stadium)}</p>
            <p><strong>Fan zone:</strong> ${escapeHTML(item.fanZone)}</p>
            <p><strong>Transport:</strong> ${escapeHTML(item.transport)}</p>
            <p>${escapeHTML(item.tip)}</p>
        </div>
    `).join('');
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboardPanel');
    if (!container) return;

    const currentUserId = state.currentUser?.id;
    const users = state.users.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        score: user.id === currentUserId ? state.passport.score : (user.score || 120)
    }));

    const sortedUsers = users.sort((a, b) => b.score - a.score);
    const rankItems = sortedUsers.map((user, index) => `
        <div class="leaderboard-row ${user.id === currentUserId ? 'current-user' : ''}">
            <div class="leaderboard-position">#${index + 1}</div>
            <div class="leaderboard-user">
                <span class="post-author-avatar">${escapeHTML(user.avatar)}</span>
                <div>
                    <strong>${escapeHTML(user.name)}</strong>
                    <p>${user.id === currentUserId ? 'You' : 'Traveler'}</p>
                </div>
            </div>
            <div class="leaderboard-score">${escapeHTML(user.score)}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="game-score-card">
            <strong>${state.passport.score}</strong>
            <p>Your current MorEcho traveler score</p>
        </div>
        <div class="leaderboard-grid">
            ${rankItems}
        </div>
    `;
}

function renderPassport() {
    const container = document.getElementById('passportPanel');
    if (!container) return;

    const stamps = cities.map(city => {
        const unlocked = state.passport.stamps.includes(city);
        return `<button class="stamp ${unlocked ? 'unlocked' : ''}" onclick="unlockStamp('${city}')">${cityData[city].code}<span>${city}</span></button>`;
    }).join('');
    const badges = state.passport.badges.length
        ? state.passport.badges.map(badge => {
            const title = typeof badge === 'string' ? badge : badge.title;
            const description = typeof badge === 'string' ? 'Unlocked achievement' : badge.description;
            return `<div class="earned-badge">${icon('trophy')}<div><strong>${escapeHTML(title)}</strong><span>${escapeHTML(description)}</span></div></div>`;
        }).join('')
        : '<p class="muted mt-20">Complete photo challenges to unlock badges.</p>';

    container.innerHTML = `
        <div class="passport-cover">
            ${icon('passport')}
            <h3>Moroccan Digital Passport</h3>
            <p>${state.passport.score} points - Level ${state.passport.level} - ${state.passport.xp} XP - Sustainable score ${state.passport.sustainableScore}%</p>
        </div>
        <div class="stamp-grid">${stamps}</div>
        <h3 class="section-title">Earned badges</h3>
        <div class="badge-grid">${badges}</div>
    `;
}

function unlockStamp(city) {
    if (!state.passport.stamps.includes(city)) {
        state.passport.stamps.push(city);
        state.passport.xp += 50;
        state.passport.score += 50;
        state.passport.level = Math.max(1, Math.floor(state.passport.score / 250) + 1);
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
    state.passport.score += 25;
    state.passport.level = Math.max(1, Math.floor(state.passport.score / 250) + 1);
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
    state.passport.score += 15;
    state.passport.level = Math.max(1, Math.floor(state.passport.score / 250) + 1);
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
