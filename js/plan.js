// ============ PLAN GENERATION FUNCTIONS ============

let selectedCity = null;

function initializeCitySelector() {
    const cityGrid = document.getElementById('cityGrid');
    cityGrid.innerHTML = '';
    
    cities.forEach(city => {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <h4>${cityData[city].emoji}</h4>
            <p>${city}</p>
        `;
        card.onclick = () => selectCity(city);
        cityGrid.appendChild(card);
    });
}

function selectCity(city) {
    selectedCity = city;
    document.querySelectorAll('.city-card').forEach(card => card.classList.remove('selected'));
    event.target.closest('.city-card').classList.add('selected');
}

function generatePlan() {
    if (!selectedCity) {
        showAlert('Please select a city', 'error');
        return;
    }

    const budget = document.getElementById('planBudget').value;
    if (!budget) {
        showAlert('Please select a budget', 'error');
        return;
    }

    showLoader();
    setTimeout(() => {
        hideLoader();
        const city = cityData[selectedCity];
        let html = `<div class="plan-container mt-20">`;
        html += `<h3 style="color: var(--primary-color); margin-bottom: 20px;">📋 Your Perfect Day in ${selectedCity}</h3>`;

        // Morning Section
        html += `<div class="plan-section">
            <h3>🌅 Morning (7-11 AM)</h3>
            <div class="plan-item">
                <strong>Breakfast:</strong> Start with traditional Moroccan breakfast at your hotel
            </div>
            <div class="plan-item">
                <strong>First Activity:</strong> ${city.monuments[0].name} - ${city.monuments[0].desc}
            </div>
            <div class="plan-item">
                <strong>Time Needed:</strong> ${city.monuments[0].time}
            </div>
            <div class="plan-item">
                <strong>Transport:</strong> ${city.transportation}
            </div>
        </div>`;

        // Afternoon Section
        html += `<div class="plan-section">
            <h3>☀️ Afternoon (11 AM - 5 PM)</h3>
            <div class="plan-item">
                <strong>Lunch:</strong> ${city.restaurants[0].name} - ${city.restaurants[0].desc}
            </div>
            <div class="plan-item">
                <strong>Price Range:</strong> ${city.restaurants[0].price}
            </div>`;
        
        if (city.monuments[1]) {
            html += `<div class="plan-item">
                <strong>Activity:</strong> ${city.monuments[1].name} - ${city.monuments[1].desc}
            </div>`;
        }
        
        if (city.monuments[2]) {
            html += `<div class="plan-item">
                <strong>Second Activity:</strong> ${city.monuments[2].name} - ${city.monuments[2].desc}
            </div>`;
        }
        
        html += `</div>`;

        // Evening Section
        html += `<div class="plan-section">
            <h3>🌆 Evening (5-10 PM)</h3>
            <div class="plan-item">
                <strong>Dinner:</strong> ${city.restaurants[1].name} - ${city.restaurants[1].desc}
            </div>
            <div class="plan-item">
                <strong>Price Range:</strong> ${city.restaurants[1].price}
            </div>
            <div class="plan-item">
                <strong>Cuisine:</strong> ${city.restaurants[1].cuisine}
            </div>
        </div>`;

        // Hotels Section
        html += `<div class="plan-section">
            <h3>🏨 Hotel Recommendations (${budget === 'budget' ? 'Budget' : budget === 'standard' ? 'Standard' : 'Luxury'})</h3>`;
        
        city.hotels.forEach(hotel => {
            html += `<div class="plan-item">
                <strong>${hotel.name}</strong> ${hotel.rating}<br/>
                💰 ${hotel.price} | ${hotel.desc}
            </div>`;
        });
        html += `</div>`;

        // Restaurants Section
        html += `<div class="plan-section">
            <h3>🍽️ Recommended Restaurants</h3>`;
        
        city.restaurants.forEach(restaurant => {
            html += `<div class="plan-item">
                <strong>${restaurant.name}</strong> (${restaurant.cuisine})<br/>
                💰 ${restaurant.price} | ${restaurant.desc}
            </div>`;
        });
        html += `</div>`;

        // Monuments Section
        html += `<div class="plan-section">
            <h3>🏛️ Historical Monuments & Attractions</h3>`;
        
        city.monuments.forEach(monument => {
            html += `<div class="plan-item">
                <strong>${monument.name}</strong><br/>
                ⏱️ ${monument.time} | ${monument.desc}
            </div>`;
        });
        html += `</div>`;

        // Transportation Section
        html += `<div class="plan-section">
            <h3>🚕 Transportation Tips</h3>
            <div class="plan-item">
                <strong>Available Options:</strong> ${city.transportation}
            </div>
            <div class="plan-item">
                <strong>Best Time to Visit:</strong> ${city.bestTime}
            </div>
            <div class="plan-item">
                <strong>Pro Tips:</strong> 
                <br/>• Negotiate taxi fares before boarding
                <br/>• Use ride-sharing apps when available
                <br/>• Consider hiring a local guide
                <br/>• Book accommodations in advance
            </div>
        </div>`;

        // Budget Breakdown
        html += `<div class="plan-section">
            <h3>💰 Budget Breakdown</h3>
            <div class="plan-item">
                <strong>Selected Budget Range:</strong> ${budget === 'budget' ? '\$50-100' : budget === 'standard' ? '\$100-250' : '\$250+'} per day
            </div>
            <div class="plan-item">
                <strong>Estimated Costs:</strong>
                <br/>• Accommodation: ${budget === 'budget' ? '\$30-50' : budget === 'standard' ? '\$50-150' : '\$150+'}/night
                <br/>• Meals: ${budget === 'budget' ? '\$15-25' : budget === 'standard' ? '\$25-50' : '\$50+'}/day
                <br/>• Activities: ${budget === 'budget' ? '\$10-20' : budget === 'standard' ? '\$20-50' : '\$50+'}/day
                <br/>• Transportation: ${budget === 'budget' ? '\$10-15' : budget === 'standard' ? '\$15-30' : '\$30+'}/day
            </div>
        </div>`;

        html += `</div>`;

        document.getElementById('planResult').innerHTML = html;

        // Add to challenges
        addPlanChallenge(selectedCity);
    }, 1500);
}

function addPlanChallenge(city) {
    const challenge = {
        id: Date.now(),
        userId: state.currentUser.id,
        city: city,
        type: 'day_plan',
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    state.challenges.push(challenge);
    state.save();
    showAlert(`Plan for ${city} added to your challenges!`, 'success');
}