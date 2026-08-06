import './style.css'
import { trails } from './data/trails.js'
import { supabase } from './supabase.js'

const app = document.querySelector('#app')

// ---------- Translations ----------
const translations = {
  en: {
    title: "Hike Trentino",
    subtitle: "Discover the best hiking trails in Trentino",
    departure: "Departure place",
    date: "Date",
    difficulty: "Difficulty",
    maxDistance: "Max Driving Distance (km)",
    minElevation: "Min Elevation (m)",
    maxElevation: "Max Elevation (m)",
    sortBy: "Sort by",
    order: "Order",
    search: "Search",
    reset: "Reset",
    chooseDate: "Choose a date...",
    chooseSorting: "Choose sorting...",
    allLevels: "All levels",
    easy: "Easy",
    moderate: "Moderate",
    hard: "Hard",
    expert: "Expert",
    distance: "Distance",
    weather: "Weather",
    elevation: "Elevation",
    ascending: "Ascending ↑",
    descending: "Descending ↓",
    better: "Better first",
    worse: "Worse first",
    startingFrom: "Starting from",
    clear: "Clear",
    weatherAtDeparture: "Weather at departure place",
    loading: "Loading weather and distances…",
    fillRequired: "Fill the required fields (*) and click Search",
    best10: "Best 10 options based on your filters",
    noResults: "No trails match your filters",
    fillAndSearch: "Fill Departure, Date and Sort by, then click Search",
    clickGuide: "Click to open guide →",
    credits: "Hike Trentino · Created by Andrew Iskros",
    weatherSource: "Weather data: Open-Meteo · Trail info: Visit Trentino",
    drive: "km drive",
    greatWeather: "Great weather",
    goodWeather: "Good weather",
    close: "Close",
    nearby: "Nearby",
    niceElevation: "Nice elevation",
    matchesFilters: "Matches your filters",
    signIn: "Sign in",
    logout: "Logout",
    createAccount: "Create account",
    email: "Email",
    password: "Password",
    firstName: "First name",
    lastName: "Last name",
    city: "City (optional)",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    pleaseWait: "Please wait...",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset password",
    sendResetLink: "Send reset link",
    backToLogin: "Back to Sign in"
  },
  it: {
    title: "Hike Trentino",
    subtitle: "Scopri i migliori sentieri di trekking in Trentino",
    departure: "Luogo di partenza",
    date: "Data",
    difficulty: "Difficoltà",
    maxDistance: "Distanza massima in auto (km)",
    minElevation: "Dislivello minimo (m)",
    maxElevation: "Dislivello massimo (m)",
    sortBy: "Ordina per",
    order: "Ordine",
    search: "Cerca",
    reset: "Reimposta",
    chooseDate: "Scegli una data...",
    chooseSorting: "Scegli ordinamento...",
    allLevels: "Tutti i livelli",
    easy: "Facile",
    moderate: "Moderato",
    hard: "Difficile",
    expert: "Esperto",
    distance: "Distanza",
    weather: "Meteo",
    elevation: "Dislivello",
    ascending: "Crescente ↑",
    descending: "Decrescente ↓",
    better: "Dal migliore",
    worse: "Dal peggiore",
    startingFrom: "Partenza da",
    clear: "Cancella",
    weatherAtDeparture: "Meteo nel luogo di partenza",
    loading: "Caricamento meteo e distanze…",
    fillRequired: "Compila i campi obbligatori (*) e clicca Cerca",
    best10: "Le migliori 10 opzioni in base ai tuoi filtri",
    noResults: "Nessun sentiero corrisponde ai filtri",
    fillAndSearch: "Inserisci Partenza, Data e Ordinamento, poi clicca Cerca",
    clickGuide: "Clicca per aprire la guida →",
    credits: "Hike Trentino · Creato da Andrew Iskros",
    weatherSource: "Dati meteo: Open-Meteo · Info sentieri: Visit Trentino",
    drive: "km in auto",
    greatWeather: "Ottimo meteo",
    goodWeather: "Buon meteo",
    close: "Vicino",
    nearby: "Nelle vicinanze",
    niceElevation: "Bel dislivello",
    matchesFilters: "Corrisponde ai filtri",
    signIn: "Accedi",
    logout: "Esci",
    createAccount: "Crea account",
    email: "Email",
    password: "Password",
    firstName: "Nome",
    lastName: "Cognome",
    city: "Città (opzionale)",
    noAccount: "Non hai un account?",
    hasAccount: "Hai già un account?",
    pleaseWait: "Attendere...",
    forgotPassword: "Password dimenticata?",
    resetPassword: "Reimposta password",
    sendResetLink: "Invia link di reset",
    backToLogin: "Torna al login"
  },
  de: {
    title: "Hike Trentino",
    subtitle: "Entdecke die besten Wanderwege im Trentino",
    departure: "Startort",
    date: "Datum",
    difficulty: "Schwierigkeit",
    maxDistance: "Max. Fahrstrecke (km)",
    minElevation: "Min. Höhenmeter (m)",
    maxElevation: "Max. Höhenmeter (m)",
    sortBy: "Sortieren nach",
    order: "Reihenfolge",
    search: "Suchen",
    reset: "Zurücksetzen",
    chooseDate: "Datum wählen...",
    chooseSorting: "Sortierung wählen...",
    allLevels: "Alle Stufen",
    easy: "Leicht",
    moderate: "Mittel",
    hard: "Schwer",
    expert: "Sehr schwer",
    distance: "Entfernung",
    weather: "Wetter",
    elevation: "Höhenmeter",
    ascending: "Aufsteigend ↑",
    descending: "Absteigend ↓",
    better: "Bessere zuerst",
    worse: "Schlechtere zuerst",
    startingFrom: "Start von",
    clear: "Löschen",
    weatherAtDeparture: "Wetter am Startort",
    loading: "Wetter und Entfernungen werden geladen…",
    fillRequired: "Pflichtfelder (*) ausfüllen und auf Suchen klicken",
    best10: "Die besten 10 Optionen nach deinen Filtern",
    noResults: "Keine Wanderungen entsprechen den Filtern",
    fillAndSearch: "Startort, Datum und Sortierung wählen, dann Suchen",
    clickGuide: "Klicken um den Guide zu öffnen →",
    credits: "Hike Trentino · Erstellt von Andrew Iskros",
    weatherSource: "Wetterdaten: Open-Meteo · Weginfo: Visit Trentino",
    drive: "km Fahrt",
    greatWeather: "Tolles Wetter",
    goodWeather: "Gutes Wetter",
    close: "Nah",
    nearby: "In der Nähe",
    niceElevation: "Schöne Höhenmeter",
    matchesFilters: "Entspricht den Filtern",
    signIn: "Anmelden",
    logout: "Abmelden",
    createAccount: "Konto erstellen",
    email: "E-Mail",
    password: "Passwort",
    firstName: "Vorname",
    lastName: "Nachname",
    city: "Stadt (optional)",
    noAccount: "Noch kein Konto?",
    hasAccount: "Bereits ein Konto?",
    pleaseWait: "Bitte warten...",
    forgotPassword: "Passwort vergessen?",
    resetPassword: "Passwort zurücksetzen",
    sendResetLink: "Reset-Link senden",
    backToLogin: "Zurück zum Login"
  }
}

// ---------- State ----------
let lang = 'en'
let currentUser = null
let showAuthModal = false
let authMode = 'login' // 'login' | 'signup' | 'forgot'
let authEmail = ''
let authPassword = ''
let authFirstName = ''
let authLastName = ''
let authCity = ''
let authError = ''
let authLoading = false
let authMessage = ''

let filters = {
  difficulty: 'all',
  maxDistance: '',
  minElevation: '',
  maxElevation: ''
}

let departure = { name: '', lat: null, lon: null }
let inputValue = ''
let suggestions = []
let showSuggestions = false

let selectedDate = ''
let weatherLoading = false
let hasSearched = false

let sortBy = ''
let sortDir = 'asc'

let results = []
let departureWeather = null

let errors = {
  departure: false,
  date: false,
  sortBy: false
}

const weatherCache = {}
const distanceCache = {}

// ---------- Helpers ----------
function t(key) {
  return translations[lang][key] || translations.en[key] || key
}

function getNext10Days() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 10; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function formatDateLabel(iso) {
  const d = new Date(iso + 'T12:00:00')
  const locale = lang === 'it' ? 'it-IT' : lang === 'de' ? 'de-DE' : 'en-GB'
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
}

function getStraightLineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function getDrivingDistanceKm(lat1, lon1, lat2, lon2) {
  const key = `${lat1.toFixed(3)},${lon1.toFixed(3)}_${lat2.toFixed(3)},${lon2.toFixed(3)}`
  if (distanceCache[key]) return distanceCache[key]

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
    const res = await fetch(url)
    const data = await res.json()

    if (data.code === 'Ok' && data.routes?.[0]) {
      const km = data.routes[0].distance / 1000
      distanceCache[key] = { km, isDriving: true }
      return distanceCache[key]
    }
  } catch (err) {
    console.warn('Driving distance failed', err)
  }

  const km = getStraightLineKm(lat1, lon1, lat2, lon2)
  distanceCache[key] = { km, isDriving: false }
  return distanceCache[key]
}

function getWeatherDescription(code) {
  if (code === 0) return { text: lang === 'it' ? 'Cielo sereno' : lang === 'de' ? 'Klarer Himmel' : 'Clear sky', icon: '☀️' }
  if (code === 1) return { text: lang === 'it' ? 'Prevalentemente sereno' : lang === 'de' ? 'Überwiegend klar' : 'Mainly clear', icon: '🌤️' }
  if (code === 2) return { text: lang === 'it' ? 'Parzialmente nuvoloso' : lang === 'de' ? 'Teilweise bewölkt' : 'Partly cloudy', icon: '⛅' }
  if (code === 3) return { text: lang === 'it' ? 'Coperto' : lang === 'de' ? 'Bedeckt' : 'Overcast', icon: '☁️' }
  if (code >= 45 && code <= 48) return { text: lang === 'it' ? 'Nebbia' : lang === 'de' ? 'Nebel' : 'Foggy', icon: '🌫️' }
  if (code >= 51 && code <= 57) return { text: lang === 'it' ? 'Pioggerella' : lang === 'de' ? 'Nieselregen' : 'Drizzle', icon: '🌦️' }
  if (code >= 61 && code <= 67) return { text: lang === 'it' ? 'Pioggia' : lang === 'de' ? 'Regen' : 'Rain', icon: '🌧️' }
  if (code >= 71 && code <= 77) return { text: lang === 'it' ? 'Neve' : lang === 'de' ? 'Schnee' : 'Snow', icon: '❄️' }
  if (code >= 80 && code <= 82) return { text: lang === 'it' ? 'Rovesci' : lang === 'de' ? 'Regenschauer' : 'Rain showers', icon: '🌦️' }
  if (code >= 85 && code <= 86) return { text: lang === 'it' ? 'Rovesci di neve' : lang === 'de' ? 'Schneeschauer' : 'Snow showers', icon: '🌨️' }
  if (code >= 95) return { text: lang === 'it' ? 'Temporale' : lang === 'de' ? 'Gewitter' : 'Thunderstorm', icon: '⛈️' }
  return { text: lang === 'it' ? 'Variabile' : lang === 'de' ? 'Wechselhaft' : 'Variable', icon: '🌡️' }
}

function calcSuitability(day) {
  if (!day) return 50
  let score = 100
  score -= (day.precipitation_probability_max ?? 0) * 0.7
  const precip = day.precipitation_sum ?? 0
  if (precip > 5) score -= 25
  else if (precip > 1) score -= 10
  const code = day.weather_code ?? 0
  if (code >= 80) score -= 30
  else if (code >= 61) score -= 20
  else if (code >= 51) score -= 10
  else if (code >= 45) score -= 8
  else if (code > 3) score -= 5
  const maxT = day.temperature_2m_max ?? 15
  if (maxT < 5) score -= 25
  else if (maxT < 10) score -= 12
  else if (maxT > 28) score -= 15
  else if (maxT > 24) score -= 5
  return Math.max(0, Math.min(100, Math.round(score)))
}

function calcRecommendationScore(trail) {
  const weatherScore = trail.weatherScore ?? 50
  const distance = trail.distanceKmValue ?? 30
  let distanceScore = Math.max(0, 100 - (distance * 2.5))
  let elevationScore = 70
  if (trail.elevationGainM >= 300 && trail.elevationGainM <= 900) elevationScore = 90
  else if (trail.elevationGainM > 1200) elevationScore = 50
  return Math.round((weatherScore * 0.5) + (distanceScore * 0.35) + (elevationScore * 0.15))
}

function getRecommendationReason(trail) {
  const reasons = []
  if (trail.weatherScore >= 75) reasons.push(t('greatWeather'))
  else if (trail.weatherScore >= 60) reasons.push(t('goodWeather'))
  if (trail.distanceKmValue <= 15) reasons.push(t('close'))
  else if (trail.distanceKmValue <= 25) reasons.push(t('nearby'))
  if (trail.elevationGainM >= 300 && trail.elevationGainM <= 900) reasons.push(t('niceElevation'))
  if (reasons.length === 0) return t('matchesFilters')
  return reasons.join(' · ')
}

function difficultyLabel(d) {
  if (d === 'T') return t('easy')
  if (d === 'E') return t('moderate')
  if (d === 'EE') return t('hard')
  if (d === 'EEA') return t('expert')
  return d
}

function difficultyValue(d) {
  if (d === 'T') return 1
  if (d === 'E') return 2
  if (d === 'EE') return 3
  if (d === 'EEA') return 4
  return 0
}

function cacheKey(lat, lon, date) {
  return `${lat.toFixed(3)},${lon.toFixed(3)},${date}`
}

// ---------- Auth ----------
async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser()
  currentUser = user
  render()
}

async function handleLogin() {
  authLoading = true
  authError = ''
  authMessage = ''
  render()

  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: authPassword
  })

  authLoading = false

  if (error) {
    authError = error.message
    render()
    return
  }

  showAuthModal = false
  resetAuthForm()
  await checkUser()
}

async function handleSignup() {
  if (!authFirstName.trim() || !authLastName.trim()) {
    authError = 'First name and Last name are required'
    render()
    return
  }

  authLoading = true
  authError = ''
  authMessage = ''
  render()

  const { data, error } = await supabase.auth.signUp({
    email: authEmail,
    password: authPassword,
    options: {
      data: {
        first_name: authFirstName.trim(),
        last_name: authLastName.trim(),
        city: authCity.trim() || null
      }
    }
  })

  authLoading = false

  if (error) {
    authError = error.message
    render()
    return
  }

  authMessage = 'Account created! Please check your email to confirm.'
  authMode = 'login'
  render()
}

async function handleForgotPassword() {
  if (!authEmail.trim()) {
    authError = 'Please enter your email'
    render()
    return
  }

  authLoading = true
  authError = ''
  authMessage = ''
  render()

  const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
    redirectTo: window.location.origin
  })

  authLoading = false

  if (error) {
    authError = error.message
    render()
    return
  }

  authMessage = 'Password reset link sent! Check your email.'
  render()
}

async function handleLogout() {
  await supabase.auth.signOut()
  currentUser = null
  render()
}

function resetAuthForm() {
  authEmail = ''
  authPassword = ''
  authFirstName = ''
  authLastName = ''
  authCity = ''
  authError = ''
  authMessage = ''
}

// ---------- Weather ----------
async function fetchWeatherFor(lat, lon, date) {
  const key = cacheKey(lat, lon, date)
  if (weatherCache[key]) return weatherCache[key]

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=10`
    const res = await fetch(url)
    const data = await res.json()

    if (data.error) return null

    if (data.daily?.time) {
      let idx = data.daily.time.indexOf(date)
      if (idx === -1) idx = 0

      const day = {
        weather_code: data.daily.weather_code[idx],
        temperature_2m_max: data.daily.temperature_2m_max[idx],
        temperature_2m_min: data.daily.temperature_2m_min[idx],
        precipitation_sum: data.daily.precipitation_sum[idx],
        precipitation_probability_max: data.daily.precipitation_probability_max[idx]
      }
      weatherCache[key] = day
      return day
    }
  } catch (err) {
    console.error(err)
  }
  return null
}

// ---------- Search ----------
async function doSearch() {
  errors.departure = !departure.lat
  errors.date = !selectedDate
  errors.sortBy = !sortBy

  if (errors.departure || errors.date || errors.sortBy) {
    render()
    return
  }

  weatherLoading = true
  hasSearched = true
  render()

  let list = trails.map(trail => {
    const straight = getStraightLineKm(departure.lat, departure.lon, trail.startLat, trail.startLon)
    return { ...trail, distanceFromDeparture: straight }
  })

  list = list.filter(t => {
    if (filters.difficulty !== 'all' && t.difficulty !== filters.difficulty) return false
    if (filters.minElevation && t.elevationGainM < Number(filters.minElevation)) return false
    if (filters.maxElevation && t.elevationGainM > Number(filters.maxElevation)) return false
    return true
  })

  list.sort((a, b) => a.distanceFromDeparture - b.distanceFromDeparture)
  const candidates = list.slice(0, 18)

  const distancePromises = candidates.map(t =>
    getDrivingDistanceKm(departure.lat, departure.lon, t.startLat, t.startLon)
  )
  const weatherPromises = [
    fetchWeatherFor(departure.lat, departure.lon, selectedDate),
    ...candidates.map(t => fetchWeatherFor(t.startLat, t.startLon, selectedDate))
  ]

  const [distances, allWeather] = await Promise.all([
    Promise.all(distancePromises),
    Promise.all(weatherPromises)
  ])

  departureWeather = allWeather[0]

  candidates.forEach((t, i) => {
    const dist = distances[i]
    t.distanceKmValue = dist.km
    t.isDrivingDistance = dist.isDriving
    t.dayWeather = allWeather[i + 1]
    t.weatherScore = calcSuitability(t.dayWeather)
    t.recommendationScore = calcRecommendationScore(t)
    t.reason = getRecommendationReason(t)
  })

  let filtered = candidates.filter(t => t.isDrivingDistance)

  if (filters.maxDistance) {
    filtered = filtered.filter(t => t.distanceKmValue <= Number(filters.maxDistance))
  }

  if (sortBy === 'weather') {
    filtered.sort((a, b) => sortDir === 'asc' ? b.weatherScore - a.weatherScore : a.weatherScore - b.weatherScore)
  } else if (sortBy === 'distance') {
    filtered.sort((a, b) => sortDir === 'asc' ? a.distanceKmValue - b.distanceKmValue : b.distanceKmValue - a.distanceKmValue)
  } else if (sortBy === 'elevation') {
    filtered.sort((a, b) => sortDir === 'asc' ? a.elevationGainM - b.elevationGainM : b.elevationGainM - a.elevationGainM)
  } else if (sortBy === 'difficulty') {
    filtered.sort((a, b) => sortDir === 'asc' ? difficultyValue(a.difficulty) - difficultyValue(b.difficulty) : difficultyValue(b.difficulty) - difficultyValue(a.difficulty))
  } else {
    filtered.sort((a, b) => b.recommendationScore - a.recommendationScore)
  }

  results = filtered.slice(0, 10)
  weatherLoading = false
  render()
}

// ---------- Geocoding ----------
async function fetchSuggestions(query) {
  if (query.length < 2) {
    suggestions = []
    showSuggestions = false
    updateSuggestionsOnly()
    return
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=${lang}&countryCode=IT`
    const res = await fetch(url)
    const data = await res.json()

    if (data.results) {
      suggestions = data.results.filter(p => {
        const admin = (p.admin1 || '').toLowerCase()
        const name = (p.name || '').toLowerCase()
        return admin.includes('trentino') || admin.includes('bolzano') ||
               admin.includes('south tyrol') || admin.includes('alto adige') ||
               name.includes('trento') || name.includes('bolzano') ||
               name.includes('merano') || name.includes('riva') ||
               name.includes('madonna') || name.includes('canazei') ||
               name.includes('moena') || name.includes('cavalese') ||
               name.includes('predazzo') || name.includes('pinzolo') ||
               name.includes('campiglio') || name.includes('molveno') ||
               name.includes('levico') || name.includes('pergine') ||
               name.includes('rovereto')
      })
      if (suggestions.length === 0) suggestions = data.results.slice(0, 6)
    } else {
      suggestions = []
    }
  } catch {
    suggestions = []
  }

  showSuggestions = true
  updateSuggestionsOnly()
}

function selectPlace(place) {
  departure = {
    name: place.name + (place.admin1 ? `, ${place.admin1}` : ''),
    lat: place.latitude,
    lon: place.longitude
  }
  inputValue = departure.name
  suggestions = []
  showSuggestions = false
  errors.departure = false
  render()
}

function updateSuggestionsOnly() {
  const container = document.querySelector('.suggestions-container')
  if (!container) return

  if (showSuggestions && suggestions.length > 0) {
    container.innerHTML = `
      <div class="suggestions">
        ${suggestions.map((s, i) => `
          <div class="suggestion-item" data-index="${i}">
            ${s.name}${s.admin1 ? `, ${s.admin1}` : ''}
          </div>
        `).join('')}
      </div>`
    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        selectPlace(suggestions[Number(item.dataset.index)])
      })
    })
  } else {
    container.innerHTML = ''
  }
}

// ---------- Render ----------
function render() {
  const depWeatherDesc = departureWeather ? getWeatherDescription(departureWeather.weather_code) : null

  const dateOptions = `
    <option value="" disabled ${!selectedDate ? 'selected' : ''}>${t('chooseDate')}</option>
    ${getNext10Days().map(d =>
      `<option value="${d}" ${d === selectedDate ? 'selected' : ''}>${formatDateLabel(d)}</option>`
    ).join('')}
  `

  const orderOptions = sortBy === 'weather'
    ? `<option value="asc">${t('better')}</option><option value="desc">${t('worse')}</option>`
    : `<option value="asc">${t('ascending')}</option><option value="desc">${t('descending')}</option>`

  app.innerHTML = `
    <div class="container">
      <div class="top-bar">
        <div class="lang-switcher">
          <button class="lang-btn ${lang === 'en' ? 'active' : ''}" data-lang="en">
            <img src="https://flagcdn.com/w40/gb.png" alt="EN" class="flag-icon"> EN
          </button>
          <button class="lang-btn ${lang === 'it' ? 'active' : ''}" data-lang="it">
            <img src="https://flagcdn.com/w40/it.png" alt="IT" class="flag-icon"> IT
          </button>
          <button class="lang-btn ${lang === 'de' ? 'active' : ''}" data-lang="de">
            <img src="https://flagcdn.com/w40/de.png" alt="DE" class="flag-icon"> DE
          </button>
        </div>

        <div class="auth-area">
          ${currentUser ? `
            <span class="user-email">${currentUser.user_metadata?.first_name || ''} ${currentUser.email}</span>
            <button id="logoutBtn" class="auth-btn">${t('logout')}</button>
          ` : `
            <button id="loginBtn" class="auth-btn">${t('signIn')}</button>
          `}
        </div>
      </div>

      <header>
        <h1>🏔️ ${t('title')}</h1>
        <p>${t('subtitle')}</p>
      </header>

      ${showAuthModal ? `
        <div class="auth-modal-overlay">
          <div class="auth-modal">
            <button id="closeAuthModal" class="close-modal">✕</button>
            
            <h2>
              ${authMode === 'login' ? t('signIn') : 
                authMode === 'signup' ? t('createAccount') : 
                t('resetPassword')}
            </h2>

            ${authMode === 'signup' ? `
              <div class="auth-row">
                <input type="text" id="authFirstName" placeholder="${t('firstName')} *" value="${authFirstName}">
                <input type="text" id="authLastName" placeholder="${t('lastName')} *" value="${authLastName}">
              </div>
              <input type="text" id="authCity" placeholder="${t('city')}" value="${authCity}">
            ` : ''}

            <input type="email" id="authEmail" placeholder="${t('email')} *" value="${authEmail}">
            
            ${authMode !== 'forgot' ? `
              <input type="password" id="authPassword" placeholder="${t('password')} *" value="${authPassword}">
            ` : ''}

            ${authError ? `<div class="auth-error">${authError}</div>` : ''}
            ${authMessage ? `<div class="auth-message">${authMessage}</div>` : ''}

            <button id="authSubmitBtn" class="search-btn" ${authLoading ? 'disabled' : ''}>
              ${authLoading ? t('pleaseWait') : 
                authMode === 'login' ? t('signIn') : 
                authMode === 'signup' ? t('createAccount') : 
                t('sendResetLink')}
            </button>

            <div class="auth-links">
              ${authMode === 'login' ? `
                <button id="forgotPasswordBtn" class="link-btn">${t('forgotPassword')}</button>
                <p>${t('noAccount')} <button id="switchToSignup" class="link-btn">${t('createAccount')}</button></p>
              ` : authMode === 'signup' ? `
                <p>${t('hasAccount')} <button id="switchToLogin" class="link-btn">${t('signIn')}</button></p>
              ` : `
                <button id="switchToLogin" class="link-btn">${t('backToLogin')}</button>
              `}
            </div>
          </div>
        </div>
      ` : ''}

      <div class="filters">
        <div class="filter-group ${errors.departure ? 'error-field' : ''}" style="flex:1;min-width:220px;position:relative">
          <label>📍 ${t('departure')} *</label>
          <input type="text" id="departureInput" placeholder="${t('departure')}..." value="${inputValue}" autocomplete="off">
          <div class="suggestions-container"></div>
        </div>

        <div class="filter-group ${errors.date ? 'error-field' : ''}">
          <label>📅 ${t('date')} *</label>
          <select id="dateSelect">${dateOptions}</select>
        </div>

        <div class="filter-group">
          <label>${t('difficulty')}</label>
          <select id="difficulty">
            <option value="all">${t('allLevels')}</option>
            <option value="T">${t('easy')} (T)</option>
            <option value="E">${t('moderate')} (E)</option>
            <option value="EE">${t('hard')} (EE)</option>
            <option value="EEA">${t('expert')} (EEA)</option>
          </select>
        </div>

        <div class="filter-group">
          <label>🚗 ${t('maxDistance')}</label>
          <input type="number" id="maxDistance" placeholder="e.g. 25" value="${filters.maxDistance}" min="1" max="80">
        </div>

        <div class="filter-group">
          <label>⬆️ ${t('minElevation')}</label>
          <input type="number" id="minElevation" placeholder="e.g. 200" value="${filters.minElevation}" min="0" max="1500" step="50">
        </div>

        <div class="filter-group">
          <label>⬆️ ${t('maxElevation')}</label>
          <input type="number" id="maxElevation" placeholder="e.g. 1200" value="${filters.maxElevation}" min="50" max="2000" step="50">
        </div>

        <div class="filter-group ${errors.sortBy ? 'error-field' : ''}">
          <label>${t('sortBy')} *</label>
          <select id="sortBy">
            <option value="" disabled ${!sortBy ? 'selected' : ''}>${t('chooseSorting')}</option>
            <option value="distance">${t('distance')}</option>
            <option value="weather">${t('weather')}</option>
            <option value="elevation">${t('elevation')}</option>
            <option value="difficulty">${t('difficulty')}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>${t('order')}</label>
          <select id="sortDir">${orderOptions}</select>
        </div>

        <div class="filter-group" style="align-self:end">
          <button id="searchBtn" class="search-btn">🔍 ${t('search')}</button>
        </div>

        <div class="filter-group" style="align-self:end">
          <button id="resetBtn" class="reset-btn">${t('reset')}</button>
        </div>
      </div>

      ${departure.lat ? `
        <div class="selected-place-bar">
          <span>📍 ${t('startingFrom')}: <strong>${departure.name}</strong></span>
          <button id="clearDeparture" class="clear-btn">✕ ${t('clear')}</button>
        </div>
      ` : ''}

      ${hasSearched ? `
        <div class="weather-bar">
          ${weatherLoading ? `<div>${t('loading')}</div>` : departureWeather ? `
            <div class="weather-info">
              <span class="weather-date">${formatDateLabel(selectedDate)}</span>
              <span class="weather-main">${depWeatherDesc.icon} ${depWeatherDesc.text}</span>
              <span>🌡️ ${Math.round(departureWeather.temperature_2m_min)}° – ${Math.round(departureWeather.temperature_2m_max)}°C</span>
              <span>🌧️ ${departureWeather.precipitation_probability_max ?? 0}%</span>
              <span>💧 ${departureWeather.precipitation_sum ?? 0} mm</span>
            </div>
            <div class="weather-note">${t('weatherAtDeparture')}</div>
          ` : `<div>—</div>`}
        </div>
      ` : ''}

      <div class="results-info">
        ${!hasSearched ? t('fillRequired') : weatherLoading ? t('loading') : t('best10')}
      </div>

      <div class="trails-list">
        ${!hasSearched ? `
          <div class="no-results">${t('fillAndSearch')}</div>
        ` : results.length === 0 ? `
          <div class="no-results">${t('noResults')}</div>
        ` : results.map(trail => {
          const w = trail.dayWeather
          const desc = w ? getWeatherDescription(w.weather_code) : null
          return `
            <div class="trail-card" data-url="${trail.guideUrl}">
              <div class="card-header">
                <h3>${trail.name}</h3>
                <span class="diff-label diff-${trail.difficulty}">${difficultyLabel(trail.difficulty)}</span>
              </div>
              <div class="trail-meta">
                <span>📍 ${trail.area}</span>
                <span>📏 ${trail.distanceKm} km</span>
                <span>⬆️ ${trail.elevationGainM} m</span>
                <span class="distance">🚗 ${trail.distanceKmValue.toFixed(1)} ${t('drive')}</span>
              </div>
              ${w ? `
                <div class="card-weather">
                  ${desc.icon} <strong>${desc.text}</strong>
                  · ${Math.round(w.temperature_2m_min)}–${Math.round(w.temperature_2m_max)}°C
                  · ${w.precipitation_probability_max ?? 0}%
                </div>
              ` : `<div class="card-weather loading">—</div>`}
              <div class="reason">${trail.reason}</div>
              <p>${trail.description}</p>
              <div class="card-hint">${t('clickGuide')}</div>
            </div>
          `
        }).join('')}
      </div>

      <footer class="credits">
        <strong>${t('credits')}</strong><br>
        ${t('weatherSource')}
      </footer>
    </div>
  `

  // Events
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      lang = btn.dataset.lang
      render()
    })
  })

  // Auth
  const loginBtn = document.getElementById('loginBtn')
  if (loginBtn) loginBtn.addEventListener('click', () => {
    showAuthModal = true
    authMode = 'login'
    resetAuthForm()
    render()
  })

  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout)

  const closeAuthModal = document.getElementById('closeAuthModal')
  if (closeAuthModal) closeAuthModal.addEventListener('click', () => {
    showAuthModal = false
    render()
  })

  const switchToSignup = document.getElementById('switchToSignup')
  if (switchToSignup) switchToSignup.addEventListener('click', () => {
    authMode = 'signup'
    authError = ''
    authMessage = ''
    render()
  })

  const switchToLogin = document.getElementById('switchToLogin')
  if (switchToLogin) switchToLogin.addEventListener('click', () => {
    authMode = 'login'
    authError = ''
    authMessage = ''
    render()
  })

  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn')
  if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', () => {
    authMode = 'forgot'
    authError = ''
    authMessage = ''
    render()
  })

  const authSubmitBtn = document.getElementById('authSubmitBtn')
  if (authSubmitBtn) authSubmitBtn.addEventListener('click', () => {
    if (authMode === 'login') handleLogin()
    else if (authMode === 'signup') handleSignup()
    else handleForgotPassword()
  })

  // Auth inputs
  ;['authEmail', 'authPassword', 'authFirstName', 'authLastName', 'authCity'].forEach(id => {
    const el = document.getElementById(id)
    if (el) {
      el.addEventListener('input', (e) => {
        if (id === 'authEmail') authEmail = e.target.value
        if (id === 'authPassword') authPassword = e.target.value
        if (id === 'authFirstName') authFirstName = e.target.value
        if (id === 'authLastName') authLastName = e.target.value
        if (id === 'authCity') authCity = e.target.value
      })
    }
  })

  // Filters
  document.getElementById('difficulty').value = filters.difficulty
  document.getElementById('difficulty').addEventListener('change', e => filters.difficulty = e.target.value)

  document.getElementById('maxDistance').addEventListener('change', e => filters.maxDistance = e.target.value)
  document.getElementById('minElevation').addEventListener('change', e => filters.minElevation = e.target.value)
  document.getElementById('maxElevation').addEventListener('change', e => filters.maxElevation = e.target.value)

  document.getElementById('sortBy').value = sortBy
  document.getElementById('sortBy').addEventListener('change', e => {
    sortBy = e.target.value
    errors.sortBy = false
    sortDir = 'asc'
    render()
  })

  document.getElementById('sortDir').value = sortDir
  document.getElementById('sortDir').addEventListener('change', e => sortDir = e.target.value)

  document.getElementById('dateSelect').addEventListener('change', e => {
    selectedDate = e.target.value
    errors.date = false
  })

  document.getElementById('searchBtn').addEventListener('click', doSearch)

  const clearBtn = document.getElementById('clearDeparture')
  if (clearBtn) clearBtn.addEventListener('click', () => {
    departure = { name: '', lat: null, lon: null }
    inputValue = ''
    departureWeather = null
    hasSearched = false
    results = []
    render()
  })

  document.getElementById('resetBtn').addEventListener('click', () => {
    filters = { difficulty: 'all', maxDistance: '', minElevation: '', maxElevation: '' }
    departure = { name: '', lat: null, lon: null }
    inputValue = ''
    selectedDate = ''
    sortBy = ''
    sortDir = 'asc'
    hasSearched = false
    results = []
    departureWeather = null
    errors = { departure: false, date: false, sortBy: false }
    render()
  })

  const input = document.getElementById('departureInput')
  let timer
  input.addEventListener('input', e => {
    inputValue = e.target.value
    clearTimeout(timer)
    timer = setTimeout(() => fetchSuggestions(inputValue), 300)
  })

  document.querySelectorAll('.trail-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.url) window.open(card.dataset.url, '_blank')
    })
  })

  updateSuggestionsOnly()
}

// Start
checkUser()