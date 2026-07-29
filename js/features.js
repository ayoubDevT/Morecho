// ============ MOR ECHO ADVANCED FEATURES ============

function icon(name) {
    if (name === 'map') {
        return '<img class="icon map-icon" src="assets/Map.png" alt="">';
    }

    const path = iconPaths[name] || iconPaths.home;
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function initializeAdvancedFeatures() {
    hydrateStaticIcons();
    renderDashboardStats();
    renderInteractiveMap();
    renderWorldCupMode();
    renderEmergency();
    renderAccessibilityPanel();
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
        { label: 'Badges earned', value: state.passport.badges.length, icon: 'trophy' },
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
            ${item.photo ? `<div class="stadium-media"><img src="${escapeHTML(item.photo)}" alt="${escapeHTML(item.stadium)}" onerror="this.remove();"></div>` : ''}
            ${icon('trophy')}
            <h3>${escapeHTML(item.city)}</h3>
            <p><strong>Stadium:</strong> ${escapeHTML(item.stadium)}</p>
            <p><strong>Fan zone:</strong> ${escapeHTML(item.fanZone)}</p>
            <p><strong>Access:</strong> ${escapeHTML(item.access)}</p>
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

