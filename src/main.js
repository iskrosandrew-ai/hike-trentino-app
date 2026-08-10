import './style.css'
import { state } from './state.js'
import { loadTrails } from './services/trails.js'
import { checkUser, handleLogin, handleSignup, handleForgotPassword, handleLogout, resetAuthForm } from './services/auth.js'
import { doSearch, fetchSuggestions, selectPlace } from './services/search.js'
import { loadFavorites, toggleFavorite } from './services/favorites.js'
import { loadCompleted, toggleCompleted } from './services/completed.js'
import { loadNotifications, markAsRead, markAllAsRead } from './services/notifications.js'
import { render } from './components/render.js'
import { t } from './utils/helpers.js'
import { trackEvent } from './services/analytics.js'

// ---------- Event binding ----------
function bindEvents() {
  // Language
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.lang = btn.dataset.lang
      trackEvent('language_changed', { language: state.lang })
      render()
      bindEvents()
    })
  })

  // Notifications
  const notificationBtn = document.getElementById('notificationBtn')
  if (notificationBtn) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      state.showNotifications = !state.showNotifications
      render()
      bindEvents()
    })
  }

  document.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', async () => {
      const id = Number(item.dataset.id)
      await markAsRead(id)
      render()
      bindEvents()
    })
  })

  const markAllBtn = document.getElementById('markAllReadBtn')
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async (e) => {
      e.stopPropagation()
      await markAllAsRead()
      render()
      bindEvents()
    })
  }

  // Close notifications when clicking outside
  document.addEventListener('click', (e) => {
    if (state.showNotifications && !e.target.closest('.notification-wrapper')) {
      state.showNotifications = false
      render()
      bindEvents()
    }
  })

  // Go to Profile page
  const profileBtn = document.getElementById('profileBtn')
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      state.currentPage = 'profile'
      state.showNotifications = false
      render()
      bindEvents()
    })
  }

  // Back to Home from Profile
  const backToHomeBtn = document.getElementById('backToHomeBtn')
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', () => {
      state.currentPage = 'home'
      render()
      bindEvents()
    })
  }

  // Stats filter
  const statsFilterEl = document.getElementById('statsFilter')
  if (statsFilterEl) {
    statsFilterEl.addEventListener('change', (e) => {
      state.statsFilter = e.target.value
      render()
      bindEvents()
    })
  }

  // Remove from favorites (Profile page)
  document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const trailId = Number(btn.dataset.id)
      await toggleFavorite(trailId)
      render()
      bindEvents()
    })
  })

  // Remove from completed (Profile page)
  document.querySelectorAll('.remove-completed-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const trailId = Number(btn.dataset.id)
      await toggleCompleted(trailId)
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
      trackEvent('logout')
      state.currentPage = 'home'
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

      if (success) {
        if (state.authMode === 'login') {
          trackEvent('login')
          await loadFavorites()
          await loadCompleted()
          await loadNotifications()
        } else if (state.authMode === 'signup') {
          trackEvent('signup')
        }
      }

      render()
      bindEvents()
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

  // Trail cards
  document.querySelectorAll('.trail-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn') || e.target.closest('.done-btn')) return

      const trailId = Number(card.dataset.id)
      trackEvent('trail_clicked', { trail_id: trailId })

      if (card.dataset.url) window.open(card.dataset.url, '_blank')
    })
  })

  // Favorite buttons
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

      if (result.success) {
        trackEvent(state.favorites.includes(trailId) ? 'favorite_added' : 'favorite_removed', {
          trail_id: trailId
        })
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

      if (result.success) {
        trackEvent(state.completed.includes(trailId) ? 'trail_completed' : 'trail_uncompleted', {
          trail_id: trailId
        })
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
    await loadCompleted()
    await loadNotifications()
  }

  render()
  bindEvents()

  trackEvent('app_opened')
}

init()