// ============ APP STATE MANAGEMENT ============
class AppState {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.posts = JSON.parse(localStorage.getItem('posts')) || [];
        this.challenges = JSON.parse(localStorage.getItem('challenges')) || [];
        this.questions = JSON.parse(localStorage.getItem('questions')) || [];
        this.blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        this.passport = JSON.parse(localStorage.getItem('passport')) || {
            stamps: [],
            badges: [],
            sustainableScore: 42,
            xp: 120,
            scannedItems: []
        };
        this.passport.stamps = this.passport.stamps || [];
        this.passport.badges = this.passport.badges || [];
        this.passport.scannedItems = this.passport.scannedItems || [];
        this.passport.sustainableScore = this.passport.sustainableScore ?? 42;
        this.passport.xp = this.passport.xp ?? 120;
    }

    save() {
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('posts', JSON.stringify(this.posts));
        localStorage.setItem('challenges', JSON.stringify(this.challenges));
        localStorage.setItem('questions', JSON.stringify(this.questions));
        localStorage.setItem('blogPosts', JSON.stringify(this.blogPosts));
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
        localStorage.setItem('passport', JSON.stringify(this.passport));
    }

    saveCurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
}

const state = new AppState();

// ============ CITY DATA ============
const cityData = {
    'Marrakech': {
        code: 'MRK',
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
        code: 'TNG',
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
        code: 'FES',
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
        code: 'AGA',
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
        code: 'RBA',
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
        code: 'CAS',
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

const iconPaths = {
    home: 'M3 11.5 12 4l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z',
    plan: 'M4 5h16v4H4V5zm0 6h7v8H4v-8zm9 0h7v8h-7v-8z',
    bot: 'M8 7V5a4 4 0 0 1 8 0v2h2a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h2zm2 0h4V5a2 2 0 0 0-4 0v2zm-2 6h2v2H8v-2zm6 0h2v2h-2v-2z',
    map: 'M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3zm0-13v11m6-8v11',
    trophy: 'M7 4h10v3h3a4 4 0 0 1-4 4 5 5 0 0 1-3 3.6V18h3v2H8v-2h3v-3.4A5 5 0 0 1 8 11a4 4 0 0 1-4-4h3V4z',
    passport: 'M6 3h11a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4h7v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z',
    market: 'M4 9l2-5h12l2 5v11H4V9zm2 0h12M8 13h8v7H8v-7z',
    route: 'M6 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm12-8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM8.5 14.5l7-5',
    shield: 'M12 3l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3z',
    access: 'M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-5 5l5-2 5 2m-5-2v5l4 7m-4-7l-4 7',
    camera: 'M4 7h4l2-3h4l2 3h4v13H4V7zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    chart: 'M4 19h16v2H4v-2zm2-2V9h3v8H6zm5 0V4h3v13h-3zm5 0v-6h3v6h-3z',
    users: 'M7 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm10 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM2 21a5 5 0 0 1 10 0H2zm11 0a4 4 0 0 1 8 0h-8z',
    user: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-8 9a8 8 0 0 1 16 0H4z',
    book: 'M5 4h12a2 2 0 0 1 2 2v15H7a2 2 0 0 1-2-2V4zm3 4h8m-8 4h8'
};

const mapLocations = [
    { id: 1, city: 'Marrakech', name: 'Jemaa el-Fnaa', category: 'UNESCO', x: 36, y: 62, price: 'Free', duration: '2 hours', hours: 'Open all day', accessible: true, desc: 'Lively public square with storytellers, food stalls and music.' },
    { id: 2, city: 'Casablanca', name: 'Hassan II Mosque', category: 'Monument', x: 46, y: 46, price: '130 MAD', duration: '1.5 hours', hours: 'Guided visits', accessible: true, desc: 'Oceanfront mosque and one of Morocco most iconic landmarks.' },
    { id: 3, city: 'Fes', name: 'Fes Medina', category: 'UNESCO', x: 58, y: 34, price: 'Free', duration: '4 hours', hours: 'Best daytime', accessible: false, desc: 'Medieval old city with craft streets, madrasas and souks.' },
    { id: 4, city: 'Agadir', name: 'Agadir Beach', category: 'Beach', x: 28, y: 73, price: 'Free', duration: '3 hours', hours: 'Open all day', accessible: true, desc: 'Long Atlantic beach with cafés, surfing and sunset walks.' },
    { id: 5, city: 'Rabat', name: 'Hassan Tower', category: 'Monument', x: 50, y: 40, price: 'Free', duration: '1 hour', hours: '9 AM - 6 PM', accessible: true, desc: 'Historic minaret beside the Mausoleum of Mohammed V.' },
    { id: 6, city: 'Tangier', name: 'Cape Spartel', category: 'Nature', x: 53, y: 20, price: 'Free', duration: '1 hour', hours: 'Open all day', accessible: false, desc: 'Scenic point where the Atlantic meets the Mediterranean.' }
];

const worldCupData = [
    { city: 'Casablanca', stadium: 'Grand Stade Hassan II', fanZone: 'Corniche Fan Walk', transport: 'Train, tram, shuttle buses', tip: 'Arrive 3 hours before kick-off and use public transport.' },
    { city: 'Rabat', stadium: 'Prince Moulay Abdellah Stadium', fanZone: 'Bouregreg Fan Zone', transport: 'Tram, bus, taxi', tip: 'Stay near Agdal or Hay Riad for easy access.' },
    { city: 'Marrakech', stadium: 'Marrakech Stadium', fanZone: 'Menara Fan Garden', transport: 'Bus, taxi, hotel shuttles', tip: 'Plan evening medina visits after match traffic calms.' },
    { city: 'Tangier', stadium: 'Ibn Batouta Stadium', fanZone: 'Marina Fan Zone', transport: 'Train, bus, taxi', tip: 'Book coastal accommodation early for match weeks.' },
    { city: 'Agadir', stadium: 'Adrar Stadium', fanZone: 'Beach Fan Village', transport: 'Bus, taxi, shuttle', tip: 'Combine match day with beach and souk visits.' },
    { city: 'Fes', stadium: 'Fes Stadium', fanZone: 'Medina Culture Fan Hub', transport: 'Bus, taxi, train', tip: 'Use licensed guides for dense medina routes.' }
];

const experiences = [
    { id: 1, title: 'Marrakech Cooking Class', city: 'Marrakech', price: '45 USD', duration: '3 hours', local: 'Amina Kitchen', sustainability: 'Supports women-led cooperative' },
    { id: 2, title: 'Fes Pottery Workshop', city: 'Fes', price: '35 USD', duration: '2 hours', local: 'Zellige Studio', sustainability: 'Preserves traditional craft' },
    { id: 3, title: 'Agadir Surf Lesson', city: 'Agadir', price: '30 USD', duration: '2 hours', local: 'Atlantic Surf School', sustainability: 'Beach cleanup included' },
    { id: 4, title: 'Tangier Food Walk', city: 'Tangier', price: '28 USD', duration: '2.5 hours', local: 'Medina Bites', sustainability: 'Local family businesses' },
    { id: 5, title: 'Rabat Heritage Tour', city: 'Rabat', price: '25 USD', duration: '3 hours', local: 'Kasbah Guides', sustainability: 'Walking-first route' },
    { id: 6, title: 'Desert Camp Preview', city: 'Marrakech', price: '120 USD', duration: '1 day', local: 'Atlas Nomad Camp', sustainability: 'Low-waste camp policy' }
];

const emergencyContacts = [
    { type: 'Police', number: '19', note: 'National emergency police number' },
    { type: 'Ambulance / Fire', number: '15', note: 'Medical and fire emergency' },
    { type: 'Tourist Police', number: '05 24 38 46 01', note: 'Useful in major tourist cities' },
    { type: 'Lost Documents', number: 'Nearest embassy or consulate', note: 'Keep passport copy in your digital passport' }
];

const recognitionSamples = [
    { keyword: 'mosque', result: 'This looks like a Moroccan mosque. Check tilework, minaret shape, calligraphy and nearby prayer schedules.' },
    { keyword: 'tagine', result: 'This may be a tagine, a slow-cooked Moroccan dish served in a clay cone-shaped pot.' },
    { keyword: 'zellige', result: 'This resembles zellige, Moroccan geometric mosaic craft used in palaces, fountains and riads.' },
    { keyword: 'default', result: 'MorEcho AI would analyze the image, identify the place or object, then explain its history, culture and nearby experiences.' }
];
