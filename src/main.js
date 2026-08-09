import './style.css'
import { state } from './state.js'
import { loadTrails } from './services/trails.js'
import { checkUser, handleLogin, handleSignup, handleForgotPassword, handleLogout, resetAuthForm } from './services/auth.js'
import { doSearch, fetchSuggestions, selectPlace } from './services/search.js'
import { loadFavorites, toggleFavorite } from './services/favorites.js'
import { loadCompleted, toggleCompleted } from './services/completed.js'
import { render } from './components/render.js'
import { t } from './utils/helpers.js'

// ---------- Event binding ----------
function bindEvents() {
  // Language
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.lang = btn.dataset.lang
      render()
      bindEvents()
    })
  })

  // Auth buttons
  const loginBtn = document.getElementById('loginBtn')
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      state.showAuthModal = true
      state.authMode = 'login'
      resetAuthForm()
      render()
      bindEvents()
    })
  }

  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await handleLogout()
      render()
      bindEvents()
    })
  }

  const closeAuthModal = document.getElementById('closeAuthModal')
  if (closeAuthModal) {
    closeAuthModal.addEventListener('click', () => {
      state.showAuthModal = false
      render()
      bindEvents()
    })
  }

  const switchToSignup = document.getElementById('switchToSignup')
  if (switchToSignup) {
    switchToSignup.addEventListener('click', () => {
      state.authMode = 'signup'
      state.authError = ''
      state.authMessage = ''
      render()
      bindEvents()
    })
  }

  const switchToLogin = document.getElementById('switchToLogin')
  if (switchToLogin) {
    switchToLogin.addEventListener('click', () => {
      state.authMode = 'login'
      state.authError = ''
      state.authMessage = ''
      render()
      bindEvents()
    })
  }

  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn')
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
      state.authMode = 'forgot'
      state.authError = ''
      state.authMessage = ''
      render()
      bindEvents()
    })
  }

  const authSubmitBtn = document.getElementById('authSubmitBtn')
  if (authSubmitBtn) {
    authSubmitBtn.addEventListener('click', async () => {
      let success = false
      if (state.authMode === 'login') success = await handleLogin()
      else if (state.authMode === 'signup') success = await handleSignup()
      else success = await handleForgotPassword()

      render()
      bindEvents()

      if (success && state.authMode === 'login') {
        await loadFavorites()
        render()
        bindEvents()
      }
    })
  }

  // Auth inputs
  ;['authEmail', 'authPassword', 'authFirstName', 'authLastName', 'authCity'].forEach(id => {
    const el = document.getElementById(id)
    if (el) {
      el.addEventListener('input', (e) => {
        if (id === 'authEmail') state.authEmail = e.target.value
        if (id === 'authPassword') state.authPassword = e.target.value
        if (id === 'authFirstName') state.authFirstName = e.target.value
        if (id === 'authLastName') state.authLastName = e.target.value
        if (id === 'authCity') state.authCity = e.target.value
      })
    }
  })

  // Filters
  const difficultyEl = document.getElementById('difficulty')
  if (difficultyEl) {
    difficultyEl.value = state.filters.difficulty
    difficultyEl.addEventListener('change', e => state.filters.difficulty = e.target.value)
  }

  const maxDistanceEl = document.getElementById('maxDistance')
  if (maxDistanceEl) maxDistanceEl.addEventListener('change', e => state.filters.maxDistance = e.target.value)

  const minElevationEl = document.getElementById('minElevation')
  if (minElevationEl) minElevationEl.addEventListener('change', e => state.filters.minElevation = e.target.value)

  const maxElevationEl = document.getElementById('maxElevation')
  if (maxElevationEl) maxElevationEl.addEventListener('change', e => state.filters.maxElevation = e.target.value)

  const sortByEl = document.getElementById('sortBy')
  if (sortByEl) {
    sortByEl.value = state.sortBy
    sortByEl.addEventListener('change', e => {
      state.sortBy = e.target.value
      state.errors.sortBy = false
      state.sortDir = 'asc'
      render()
      bindEvents()
    })
  }

  const sortDirEl = document.getElementById('sortDir')
  if (sortDirEl) {
    sortDirEl.value = state.sortDir
    sortDirEl.addEventListener('change', e => state.sortDir = e.target.value)
  }

  const dateSelectEl = document.getElementById('dateSelect')
  if (dateSelectEl) {
    dateSelectEl.addEventListener('change', e => {
      state.selectedDate = e.target.value
      state.errors.date = false
    })
  }

  // Search & Reset
  const searchBtn = document.getElementById('searchBtn')
  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      await doSearch()
      render()
      bindEvents()
    })
  }

  const clearBtn = document.getElementById('clearDeparture')
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.departure = { name: '', lat: null, lon: null }
      state.inputValue = ''
      state.departureWeather = null
      state.hasSearched = false
      state.results = []
      render()
      bindEvents()
    })
  }

  const resetBtn = document.getElementById('resetBtn')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.filters = { difficulty: 'all', maxDistance: '', minElevation: '', maxElevation: '' }
      state.departure = { name: '', lat: null, lon: null }
      state.inputValue = ''
      state.selectedDate = ''
      state.sortBy = ''
      state.sortDir = 'asc'
      state.hasSearched = false
      state.results = []
      state.departureWeather = null
      state.errors = { departure: false, date: false, sortBy: false }
      render()
      bindEvents()
    })
  }

  // Departure input
  const input = document.getElementById('departureInput')
  if (input) {
    let timer
    input.addEventListener('input', e => {
      state.inputValue = e.target.value
      clearTimeout(timer)
      timer = setTimeout(async () => {
        await fetchSuggestions(state.inputValue)
        updateSuggestionsOnly()
      }, 300)
    })
  }

  // Trail cards + Favorite buttons
  document.querySelectorAll('.trail-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open guide if clicking the favorite button
      if (e.target.closest('.favorite-btn')) return
      if (card.dataset.url) window.open(card.dataset.url, '_blank')
    })
  })

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const trailId = Number(btn.dataset.id)
      const result = await toggleFavorite(trailId)

      if (result.needsLogin) {
        alert(t('loginRequired'))
        state.showAuthModal = true
        state.authMode = 'login'
        render()
        bindEvents()
        return
      }

      render()
      bindEvents()
    })
  })
    // Done buttons
    document.querySelectorAll('.done-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const trailId = Number(btn.dataset.id)
        const result = await toggleCompleted(trailId)
  
        if (result.needsLogin) {
          alert(t('loginRequired'))
          state.showAuthModal = true
          state.authMode = 'login'
          render()
          bindEvents()
          return
        }
  
        render()
        bindEvents()
      })
    })

  updateSuggestionsOnly()
}

function updateSuggestionsOnly() {
  const container = document.querySelector('.suggestions-container')
  if (!container) return

  if (state.showSuggestions && state.suggestions.length > 0) {
    container.innerHTML = `
      <div class="suggestions">
        ${state.suggestions.map((s, i) => `
          <div class="suggestion-item" data-index="${i}">
            ${s.name}${s.admin1 ? `, ${s.admin1}` : ''}
          </div>
        `).join('')}
      </div>`

    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        selectPlace(state.suggestions[Number(item.dataset.index)])
        render()
        bindEvents()
      })
    })
  } else {
    container.innerHTML = ''
  }
}

// ---------- Start the app ----------
async function init() {
  await loadTrails()
  await checkUser()
  if (state.currentUser) {
    await loadFavorites()
  }
  render()
  bindEvents()
}

init()