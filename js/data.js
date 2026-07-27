// ============ APP STATE MANAGEMENT ============
class AppState {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.posts = JSON.parse(localStorage.getItem('posts')) || [];
        this.challenges = JSON.parse(localStorage.getItem('challenges')) || [];
        this.questions = JSON.parse(localStorage.getItem('questions')) || [];
        this.blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    }

    save() {
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('posts', JSON.stringify(this.posts));
        localStorage.setItem('challenges', JSON.stringify(this.challenges));
        localStorage.setItem('questions', JSON.stringify(this.questions));
        localStorage.setItem('blogPosts', JSON.stringify(this.blogPosts));
    }

    saveCurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
}

const state = new AppState();

// ============ CITY DATA ============
const cityData = {
    'Marrakech': {
        emoji: 'MRK',
        description: 'The Red City',
        hotels: [
            { name: 'Riad Dar Anika', price: '\$80-150', rating: '5 stars', desc: 'Luxury riad in the medina' },
            { name: 'Atlas Almohad Hotel', price: '\$50-100', rating: '4 stars', desc: 'Modern comfort with pool' },
            { name: 'Kasbah Tamadot', price: '\$200+', rating: '5 stars', desc: 'Luxury resort with Atlas views' }
        ],
        restaurants: [
            { name: 'Le Jardin', cuisine: 'Moroccan', price: '\$15-25', desc: 'Traditional tagine and couscous' },
            { name: 'Nomad', cuisine: 'Fusion', price: '\$20-35', desc: 'Modern Moroccan cuisine' },
            { name: 'Kacha Kacha', cuisine: 'Street Food', price: '\$5-10', desc: 'Authentic local flavors' }
        ],
        monuments: [
            { name: 'Koutoubia Mosque', time: '2-3 hours', desc: 'Iconic mosque with stunning architecture' },
            { name: 'Medina (Old Town)', time: '3-4 hours', desc: 'Historic marketplace and streets' },
            { name: 'Bahia Palace', time: '1-2 hours', desc: 'Beautiful 19th-century palace' },
            { name: 'Jemaa el-Fnaa Square', time: '2 hours', desc: 'Vibrant square with street performers' }
        ],
        transportation: 'Taxis, Buses, Horse-drawn carriages',
        bestTime: 'Morning'
    },
    'Tangier': {
        emoji: 'TNG',
        description: 'Gateway to Africa',
        hotels: [
            { name: 'Hilton Tangier', price: '\$100-150', rating: '5 stars', desc: 'Beachfront luxury' },
            { name: 'La Tangerine', price: '\$60-120', rating: '4 stars', desc: 'Charming boutique hotel' },
            { name: 'Mamora Beach Resort', price: '\$80-140', rating: '4 stars', desc: 'Beach access with modern amenities' }
        ],
        restaurants: [
            { name: 'Le Salon Bleu', cuisine: 'Mediterranean', price: '\$25-40', desc: 'Sea view dining' },
            { name: 'Dar Chaoui', cuisine: 'Moroccan', price: '\$15-25', desc: 'Traditional coastal cuisine' },
            { name: 'Cafe Hafa', cuisine: 'Moroccan Tea', price: '\$3-8', desc: 'Cliffside tea house' }
        ],
        monuments: [
            { name: 'Kasbah Museum', time: '1-2 hours', desc: 'Historic fortress museum' },
            { name: 'Medina Souks', time: '2-3 hours', desc: 'Historic marketplace' },
            { name: 'Cape Spartel', time: '1 hour', desc: 'Scenic coastal viewpoint' },
            { name: 'Caves of Hercules', time: '1.5 hours', desc: 'Ancient sea caves' }
        ],
        transportation: 'Taxis, Buses, Beach shuttles',
        bestTime: 'Afternoon'
    },
    'Fes': {
        emoji: 'FES',
        description: 'The Spiritual Heart',
        hotels: [
            { name: 'Palais Jamai', price: '\$120-180', rating: '5 stars', desc: 'Stunning palace hotel' },
            { name: 'Riad Fes', price: '\$90-150', rating: '4 stars', desc: 'Traditional riad luxury' },
            { name: 'Sofitel Fes Palais Jamai', price: '\$100-160', rating: '5 stars', desc: 'Premium palace hotel' }
        ],
        restaurants: [
            { name: 'Restaurant Dar Baraka', cuisine: 'Moroccan', price: '\$20-30', desc: 'Rooftop dining' },
            { name: 'Dar Roumana', cuisine: 'Moroccan', price: '\$25-35', desc: 'Fine dining experience' },
            { name: 'Caid Restaurant', cuisine: 'Local', price: '\$10-18', desc: 'Budget-friendly local food' }
        ],
        monuments: [
            { name: 'Al Quaraouiyine University', time: '1-2 hours', desc: 'One of the oldest universities' },
            { name: 'Fes Medina', time: '4-5 hours', desc: 'Medieval walled city' },
            { name: 'Bab Bou Jeloud Gate', time: '1 hour', desc: 'Iconic blue gate entrance' },
            { name: 'Tanneries of Fes', time: '1.5 hours', desc: 'Traditional leather dyeing' }
        ],
        transportation: 'Taxis, Walking tours, Local guides',
        bestTime: 'Early morning'
    },
    'Agadir': {
        emoji: 'AGA',
        description: 'Beach Paradise',
        hotels: [
            { name: 'Sofitel Agadir Royal Bay', price: '\$120-180', rating: '5 stars', desc: 'Luxury beach resort' },
            { name: 'Atlantic Palace', price: '\$80-130', rating: '4 stars', desc: 'Modern beachfront hotel' },
            { name: 'Ibis Agadir', price: '\$50-100', rating: '3 stars', desc: 'Budget beach option' }
        ],
        restaurants: [
            { name: 'Restaurant Francais', cuisine: 'French', price: '\$20-40', desc: 'Upscale dining' },
            { name: 'Fisherman', cuisine: 'Seafood', price: '\$15-30', desc: 'Fresh fish specialties' },
            { name: 'Beach Club', cuisine: 'International', price: '\$10-25', desc: 'Casual beach dining' }
        ],
        monuments: [
            { name: 'Agadir Beach', time: '2-3 hours', desc: 'Beautiful sandy beach' },
            { name: 'Kasbah Agadir', time: '1 hour', desc: 'Historic hilltop fortress' },
            { name: 'Souk El Had', time: '2 hours', desc: 'Weekly market' },
            { name: 'Paradise Valley', time: '3-4 hours', desc: 'Nature reserve with waterfalls' }
        ],
        transportation: 'Taxis, Buses, Beach shuttles, Car rentals',
        bestTime: 'Morning and afternoon'
    },
    'Rabat': {
        emoji: 'RBA',
        description: 'The Capital',
        hotels: [
            { name: 'Sofitel Rabat Jardin', price: '\$130-180', rating: '5 stars', desc: 'Luxury garden hotel' },
            { name: 'Riad Dar Anika', price: '\$80-140', rating: '4 stars', desc: 'Traditional riad' },
            { name: 'Hotel Transatlantique', price: '\$60-110', rating: '4 stars', desc: 'Riverside location' }
        ],
        restaurants: [
            { name: 'Le Grand Comptoir', cuisine: 'French', price: '\$25-45', desc: 'Fine dining' },
            { name: 'Dar Baraka', cuisine: 'Moroccan', price: '\$15-28', desc: 'Traditional cuisine' },
            { name: 'Cafe Maure', cuisine: 'Moroccan Tea', price: '\$3-8', desc: 'Riverside tea house' }
        ],
        monuments: [
            { name: 'Royal Palace', time: '1 hour', desc: 'Impressive imperial palace' },
            { name: 'Hassan Tower', time: '1 hour', desc: 'Iconic unfinished minaret' },
            { name: 'Medina of Rabat', time: '2-3 hours', desc: 'Historic old town' },
            { name: 'Mausoleum of Mohammed V', time: '1 hour', desc: 'Stunning royal mausoleum' }
        ],
        transportation: 'Taxis, Buses, Riverside walks',
        bestTime: 'Morning'
    },
    'Casablanca': {
        emoji: 'CAS',
        description: 'The White City',
        hotels: [
            { name: 'Royal Mansour', price: '\$200+', rating: '5 stars', desc: 'Ultra-luxury palace hotel' },
            { name: 'Sofitel Casablanca', price: '\$120-180', rating: '5 stars', desc: 'Oceanfront luxury' },
            { name: 'Ibis Casablanca', price: '\$60-100', rating: '3 stars', desc: 'Budget-friendly option' }
        ],
        restaurants: [
            { name: 'Casablanca Nights', cuisine: 'Moroccan', price: '\$20-35', desc: 'Upscale Moroccan' },
            { name: 'Le Louis', cuisine: 'French', price: '\$25-40', desc: 'Fine French dining' },
            { name: 'Fish Beach', cuisine: 'Seafood', price: '\$15-30', desc: 'Fresh seafood' }
        ],
        monuments: [
            { name: 'Hassan II Mosque', time: '1.5 hours', desc: 'Magnificent mosque by the sea' },
            { name: 'Medina of Casablanca', time: '2-3 hours', desc: 'Historic marketplace' },
            { name: 'Corniche', time: '2 hours', desc: 'Coastal promenade' },
            { name: 'Royal Palace', time: '1 hour', desc: 'Impressive palace grounds' }
        ],
        transportation: 'Taxis, Buses, Metro, Tram',
        bestTime: 'Morning and evening'
    }
};

const cities = Object.keys(cityData);
