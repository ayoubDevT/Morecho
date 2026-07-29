// ============ PLAN GENERATION FUNCTIONS ============

const PLAN_API_URL = 'https://ayouby.app.n8n.cloud/webhook/morocco-day-plan';
let selectedCity = null;

function initializeCitySelector() {
    const cityGrid = document.getElementById('cityGrid');
    if (!cityGrid) return;
    cityGrid.innerHTML = '';

    cities.forEach(city => {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <h4>${cityData[city].code}</h4>
            <p>${city}</p>
        `;
        if (city === selectedCity) {
            card.classList.add('selected');
        }
        card.onclick = () => selectCity(city, card);
        cityGrid.appendChild(card);
    });
}

function selectCity(city, selectedCard) {
    selectedCity = city;
    document.querySelectorAll('.city-card').forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
}

function showPlannerTab(tabName) {
    const isHistory = tabName === 'historyPlan';
    const addPlanPanel = document.getElementById('addPlanPanel');
    const historyPlanPanel = document.getElementById('historyPlanPanel');
    const addPlanTab = document.getElementById('addPlanTab');
    const historyPlanTab = document.getElementById('historyPlanTab');

    if (!addPlanPanel || !historyPlanPanel) return;

    addPlanPanel.classList.toggle('active', !isHistory);
    historyPlanPanel.classList.toggle('active', isHistory);
    addPlanTab?.classList.toggle('active', !isHistory);
    historyPlanTab?.classList.toggle('active', isHistory);

    if (isHistory) {
        renderPlanHistory();
    } else {
        initializeCitySelector();
    }
}

async function generatePlan() {
    if (!selectedCity) {
        showAlert('Please select a city', 'error');
        return;
    }

    const budget = document.getElementById('planBudget').value;
    const travelStyle = document.getElementById('planTravelStyle').value;
    const interests = document.getElementById('planInterests').value.trim();
    const planResult = document.getElementById('planResult');

    planResult.innerHTML = '';
    showLoader();

    try {
        const response = await fetch(PLAN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                city: selectedCity,
                budget,
                travel_style: travelStyle,
                interests,
                language: 'en'
            })
        });

        if (!response.ok) {
            throw new Error(`Server error ${response.status}`);
        }

        const rawData = await response.json();
        const data = Array.isArray(rawData) ? rawData[0] : rawData;

        if (!data) {
            throw new Error('The planner returned an empty response.');
        }

        if (data.error) {
            throw new Error(data.message || 'The planner could not generate this itinerary.');
        }

        const html = renderGeneratedPlan(data, { city: selectedCity, budget, travelStyle });
        planResult.innerHTML = html;
        planResult.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const historyPlan = savePlanToHistory({
            city: data.city || selectedCity,
            budget,
            travelStyle,
            title: `${data.city || selectedCity} Day Plan`,
            html
        });
        addGeneratedPlanChallenges(data, historyPlan);
        showAlert(`Plan for ${data.city || selectedCity} generated and saved!`, 'success');
    } catch (error) {
        planResult.innerHTML = `
            <div class="plan-error">
                <h3>Could not generate the plan</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;
        showAlert('Could not generate the plan. Please try again.', 'error');
    } finally {
        hideLoader();
    }
}

function renderGeneratedPlan(data, fallback) {
    const dayPlan = data.day_plan || {};
    const recommendations = data.recommendations || {};
    let html = '<div class="plan-output mt-20">';

    html += `
        <div class="plan-city-banner">
            <h3>${escapeHTML(data.city || fallback.city)}, Morocco</h3>
            <p>${escapeHTML(data.date || 'Personalized day itinerary')}</p>
            <div class="plan-chip-row">
                <span class="pill">${escapeHTML(data.budget || formatPlanBudget(fallback.budget))}</span>
                <span class="pill">${escapeHTML(data.travel_style || formatTravelStyle(fallback.travelStyle))}</span>
            </div>
        </div>
    `;

    html += renderTimelineSection('Your Day Plan', [
        dayPlan.morning && timelineItem(dayPlan.morning.time, dayPlan.morning.activity, dayPlan.morning.description, dayPlan.morning.tips),
        dayPlan.coffee_break && timelineItem(dayPlan.coffee_break.time, dayPlan.coffee_break.name, dayPlan.coffee_break.description, dayPlan.coffee_break.location)
    ].filter(Boolean));

    if (dayPlan.lunch) {
        html += renderPlanTitle('Lunch');
        html += renderDualCard(dayPlan.lunch.official_partner, dayPlan.lunch.alternative);
    }

    if (Array.isArray(dayPlan.afternoon) && dayPlan.afternoon.length) {
        html += renderTimelineSection('Afternoon', dayPlan.afternoon.map(item => (
            timelineItem(item.time, item.activity, item.description, item.tips, item.is_heritage_monument)
        )));
    }

    if (dayPlan.evening) {
        html += renderTimelineSection('Evening', [
            timelineItem(dayPlan.evening.time, dayPlan.evening.activity, dayPlan.evening.description, dayPlan.evening.tips, dayPlan.evening.is_heritage_monument)
        ]);
    }

    if (dayPlan.dinner) {
        html += renderPlanTitle('Dinner');
        html += renderDualCard(dayPlan.dinner.official_partner, dayPlan.dinner.alternative);
    }

    if (Array.isArray(data.monuments) && data.monuments.length) {
        html += renderPlanTitle('Heritage Monuments');
        html += `<div class="plan-monuments-grid">${data.monuments.map(renderMonumentCard).join('')}</div>`;
    }

    if (recommendations.hotel) {
        html += renderPlanTitle('Where to Stay');
        html += renderDualCard(recommendations.hotel.official_partner, recommendations.hotel.alternative);
    }

    if (recommendations.transport) {
        html += renderPlanTitle('Getting Around');
        html += renderDualCard(recommendations.transport.official_partner, recommendations.transport.alternative);
    }

    if (Array.isArray(data.local_food_to_try) && data.local_food_to_try.length) {
        html += renderPlanTitle('Local Food to Try');
        html += `<div class="food-list">${data.local_food_to_try.map(food => `<span class="food-tag">${escapeHTML(food)}</span>`).join('')}</div>`;
    }

    if (data.practical_tips) {
        html += renderPracticalTips(data.practical_tips);
    }

    if (data.heritage_leaderboard) {
        html += renderLeaderboardInfo(data.heritage_leaderboard);
    }

    html += '</div>';
    return html;
}

function renderPlanTitle(title) {
    return `<h3 class="plan-output-title">${escapeHTML(title)}</h3>`;
}

function renderTimelineSection(title, items) {
    if (!items.length) return '';
    return `${renderPlanTitle(title)}<div class="plan-timeline">${items.join('')}</div>`;
}

function timelineItem(time, title, description, note, isHeritage = false) {
    return `
        <div class="plan-timeline-card">
            <div class="plan-time">${escapeHTML(time || 'Flexible')}</div>
            <div>
                <h4>${escapeHTML(title || 'Recommended stop')}</h4>
                <p>${escapeHTML(description || '')}</p>
                ${note ? `<div class="plan-note">${escapeHTML(note)}</div>` : ''}
                ${isHeritage ? '<span class="badge-heritage">Heritage Challenge</span>' : ''}
            </div>
        </div>
    `;
}

function renderDualCard(partner, alternative) {
    return `
        <div class="plan-dual-card">
            ${renderOptionCard(partner, 'Official Partner', 'partner')}
            ${renderOptionCard(alternative, 'Alternative', 'alternative')}
        </div>
    `;
}

function renderOptionCard(option, label, type) {
    if (!option) {
        return `
            <div class="plan-option-card ${type}">
                <span>${escapeHTML(label)}</span>
                <h4>Recommendation pending</h4>
                <p>No option was returned for this part of the plan.</p>
            </div>
        `;
    }

    return `
        <div class="plan-option-card ${type}">
            <span>${escapeHTML(label)}</span>
            <h4>${escapeHTML(option.name)}</h4>
            <p>${escapeHTML(option.description)}</p>
            <small>${escapeHTML(option.location || option.price_range || '')}</small>
            ${renderPartnerRewards(option.partner_rewards)}
        </div>
    `;
}

function renderPartnerRewards(rewards) {
    if (!rewards) return '';

    let html = '<div class="plan-rewards"><strong>Partner Rewards</strong>';
    if (rewards.double_heritage_points) {
        html += '<br>Double Heritage Challenge points';
    }
    if (rewards.coupon_available && rewards.coupon_description) {
        html += `<br>${escapeHTML(rewards.coupon_description)}`;
    }
    html += '</div>';
    return html;
}

function renderMonumentCard(monument) {
    return `
        <div class="plan-monument-card">
            <h4>${escapeHTML(monument.name)}</h4>
            <span>${escapeHTML(monument.type)}</span>
            <p>${escapeHTML(monument.description)}</p>
            <small>${escapeHTML(monument.location)}${monument.entry_fee_mad === 0 ? ' - Free entry' : monument.entry_fee_mad ? ` - about ${escapeHTML(monument.entry_fee_mad)} MAD` : ''}</small>
            ${monument.heritage_challenge?.eligible ? `
                <div class="plan-challenge">
                    <strong>Heritage Challenge</strong><br>${escapeHTML(monument.heritage_challenge.instruction)}
                </div>
            ` : ''}
        </div>
    `;
}

function renderPracticalTips(tips) {
    const items = [
        ['Getting Around', tips.getting_around],
        ['Dress Code', tips.dress_code],
        ['Currency', tips.currency],
        ['Language', tips.language]
    ].filter(([, value]) => value);

    if (tips.budget_estimate) {
        const budget = tips.budget_estimate;
        items.push([
            'Budget Estimate',
            `Budget: ${budget.budget_mad_per_day || '-'} MAD/day | Mid-range: ${budget.mid_range_mad_per_day || '-'} MAD/day | Luxury: ${budget.luxury_mad_per_day || '-'} MAD/day`
        ]);
    }

    if (!items.length) return '';

    return `
        ${renderPlanTitle('Practical Tips')}
        <div class="plan-tips-grid">
            ${items.map(([title, value]) => `
                <div class="plan-tip-card">
                    <strong>${escapeHTML(title)}</strong>
                    <p>${escapeHTML(value)}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderLeaderboardInfo(leaderboard) {
    const points = leaderboard.how_to_earn_points || [];
    if (!points.length && !leaderboard.partner_bonus) return '';

    return `
        ${renderPlanTitle('Heritage Leaderboard')}
        <div class="plan-leaderboard">
            ${points.length ? `<ul>${points.map(point => `<li>${escapeHTML(point)}</li>`).join('')}</ul>` : ''}
            ${leaderboard.partner_bonus ? `<p>${escapeHTML(leaderboard.partner_bonus)}</p>` : ''}
        </div>
    `;
}

function savePlanToHistory(plan) {
    const historyPlan = {
        id: Date.now(),
        userId: state.currentUser.id,
        city: plan.city,
        budget: plan.budget,
        travelStyle: plan.travelStyle,
        title: plan.title,
        html: plan.html,
        createdAt: new Date().toISOString()
    };

    state.plans.unshift(historyPlan);
    state.save();
    return historyPlan;
}

function renderPlanHistory() {
    const planHistory = document.getElementById('planHistory');
    if (!planHistory) return;

    const userPlans = (state.plans || []).filter(plan => plan.userId === state.currentUser.id);

    if (userPlans.length === 0) {
        planHistory.innerHTML = `
            <div class="empty-state">
                <h3>No saved plans yet</h3>
                <p>Create your first itinerary from Add Plan.</p>
                <button class="btn btn-primary" onclick="showPlannerTab('addPlan')">Add Plan</button>
            </div>
        `;
        return;
    }

    planHistory.innerHTML = `
        <div class="plan-history-list">
            ${userPlans.map(plan => `
                <article class="plan-history-card">
                    <div>
                        <span class="pill">${escapeHTML(formatPlanBudget(plan.budget))}</span>
                        <h3>${escapeHTML(plan.title)}</h3>
                        <p>${escapeHTML(formatDate(plan.createdAt))}</p>
                    </div>
                    <button class="btn btn-secondary" onclick="openHistoryPlan(${plan.id})">View Plan</button>
                </article>
            `).join('')}
        </div>
    `;
}

function openHistoryPlan(planId) {
    const plan = (state.plans || []).find(item => item.id === planId && item.userId === state.currentUser.id);
    if (!plan) return;

    showPlannerTab('addPlan');
    document.getElementById('planResult').innerHTML = plan.html;
    showAlert(`${plan.city} plan loaded`, 'info');
}

function formatPlanBudget(budget) {
    if (budget === 'budget') return 'Budget';
    if (budget === 'mid-range' || budget === 'standard') return 'Mid-range';
    if (budget === 'luxury') return 'Luxury';
    return 'Plan';
}

function formatTravelStyle(style) {
    if (!style) return 'Traveler';
    return style.charAt(0).toUpperCase() + style.slice(1);
}

function addGeneratedPlanChallenges(planData, savedPlan) {
    const city = savedPlan.city;
    const heritageMonuments = (planData.monuments || []).filter(monument => monument.heritage_challenge?.eligible);
    const generatedChallenges = heritageMonuments.length
        ? heritageMonuments.map(monument => generatedHeritageChallenge(monument, savedPlan))
        : [generatedDayPlanChallenge(savedPlan)];

    generatedChallenges.forEach(challenge => state.challenges.push(challenge));
    state.save();
}

function generatedHeritageChallenge(monument, savedPlan) {
    const pointsByCity = {
        Marrakech: 120,
        Casablanca: 120,
        Fes: 130,
        Agadir: 90,
        Rabat: 110,
        Tangier: 100
    };
    const city = savedPlan.city;
    const instruction = monument.heritage_challenge?.instruction || `Take a photo at ${monument.name} and share what you learned.`;

    return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        userId: state.currentUser.id,
        city: city,
        planId: savedPlan.id,
        source: 'planner_generator',
        title: `${monument.name} Heritage Challenge`,
        category: 'Generated Plan',
        points: pointsByCity[city] || 100,
        badge: `${city} Heritage Explorer`,
        evidence: instruction,
        steps: [
            `Visit ${monument.name}`,
            instruction,
            'Upload photo proof'
        ],
        type: 'heritage_challenge',
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null,
        proofImage: '',
        proofNote: ''
    };
}

function generatedDayPlanChallenge(savedPlan) {
    const pointsByCity = {
        Marrakech: 120,
        Casablanca: 120,
        Fes: 130,
        Agadir: 90,
        Rabat: 110,
        Tangier: 100
    };
    const city = savedPlan.city;

    return {
        id: Date.now(),
        userId: state.currentUser.id,
        city,
        planId: savedPlan.id,
        source: 'planner_generator',
        title: `${city} Generated Plan Quest`,
        category: 'Generated Plan',
        points: pointsByCity[city] || 100,
        badge: `${city} Explorer`,
        evidence: `Upload a photo from one stop in your generated ${city} itinerary.`,
        steps: ['Generate your plan', 'Visit one recommended stop', 'Upload photo proof'],
        type: 'generated_day_plan',
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null,
        proofImage: '',
        proofNote: ''
    };
}
