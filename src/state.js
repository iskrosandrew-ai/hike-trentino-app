export const state = {

    // Trails
    trails: [],
    trailsLoading: true,
    trailsError: null,
  
    // Language
    lang: 'en',
  
    // Auth
    currentUser: null,
    showAuthModal: false,
    authMode: 'login', // 'login' | 'signup' | 'forgot'
    authEmail: '',
    authPassword: '',
    authFirstName: '',
    authLastName: '',
    authCity: '',
    authError: '',
    authLoading: false,
    authMessage: '',
  
    // Filters
    filters: {
      difficulty: 'all',
      maxDistance: '',
      minElevation: '',
      maxElevation: ''
    },
  
    // Departure
    departure: { name: '', lat: null, lon: null },
    inputValue: '',
    suggestions: [],
    showSuggestions: false,
  
    // Search
    selectedDate: '',
    weatherLoading: false,
    hasSearched: false,
    sortBy: '',
    sortDir: 'asc',
    results: [],
    departureWeather: null,
  
    // Validation
    errors: {
      departure: false,
      date: false,
      sortBy: false
    },
  
    // Caches
    weatherCache: {},
    distanceCache: {},
  
    // Favorites & Completed (for later)
    favorites: [],
    completed: [],

    // Notifications
    notifications: [],
    unreadCount: 0,
    showNotifications: false,

  currentPage: 'home',      // 'home' | 'profile'
  statsFilter: 'all'        // 'all' | 'year' | 'month'
  }

