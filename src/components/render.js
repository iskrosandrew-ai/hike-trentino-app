import { state } from '../state.js'
import { t, getNext10Days, formatDateLabel, getWeatherDescription, difficultyLabel } from '../utils/helpers.js'
import { isFavorite } from '../services/favorites.js'
import { isCompleted } from '../services/completed.js'
import { getCompletedStats } from '../services/profile.js'

export function render() {
  const app = document.querySelector('#app')

  // ====================== PROFILE PAGE ======================
  if (state.currentPage === 'profile') {
    const stats = getCompletedStats()
    const user = state.currentUser
    const firstName = user?.user_metadata?.first_name || ''
    const lastName = user?.user_metadata?.last_name || ''
    const city = user?.user_metadata?.city || ''

    const favoriteTrails = state.trails.filter(t => state.favorites.includes(t.id))
    const completedTrails = state.trails.filter(t => state.completed.includes(t.id))

    app.innerHTML = `
      <div class="container">
        <div class="top-bar">
          <div class="lang-switcher">
            <button class="lang-btn ${state.lang === 'en' ? 'active' : ''}" data-lang="en">
              <img src="https://flagcdn.com/w40/gb.png" alt="EN" class="flag-icon"> EN
            </button>
            <button class="lang-btn ${state.lang === 'it' ? 'active' : ''}" data-lang="it">
              <img src="https://flagcdn.com/w40/it.png" alt="IT" class="flag-icon"> IT
            </button>
            <button class="lang-btn ${state.lang === 'de' ? 'active' : ''}" data-lang="de">
              <img src="https://flagcdn.com/w40/de.png" alt="DE" class="flag-icon"> DE
            </button>
          </div>

          <div class="auth-area">
            <button id="backToHomeBtn" class="auth-btn">← Back</button>
            <button id="logoutBtn" class="auth-btn">${t('logout')}</button>
          </div>
        </div>

        <header class="profile-header">
          <h1>👤 ${firstName} ${lastName}</h1>
          ${city ? `<p class="profile-city">📍 ${city}</p>` : ''}
        </header>

        <!-- Statistics -->
        <div class="stats-box">
          <div class="stats-header">
            <h2>Statistics</h2>
            <select id="statsFilter">
              <option value="all" ${state.statsFilter === 'all' ? 'selected' : ''}>All time</option>
              <option value="year" ${state.statsFilter === 'year' ? 'selected' : ''}>This year</option>
              <option value="month" ${state.statsFilter === 'month' ? 'selected' : ''}>This month</option>
            </select>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${stats.totalCompleted}</div>
              <div class="stat-label">Trails completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.totalElevation}</div>
              <div class="stat-label">Total elevation (m)</div>
            </div>
          </div>
        </div>

        <!-- Favorites -->
        <div class="profile-section">
          <h2>❤️ Favorites (${favoriteTrails.length})</h2>
          ${favoriteTrails.length === 0 ? `
            <div class="empty-state">No favorites yet. Heart some trails!</div>
          ` : `
            <div class="profile-list">
              ${favoriteTrails.map(trail => `
                <div class="profile-item">
                  <div class="profile-item-info">
                    <strong>${trail.name}</strong>
                    <span class="diff-label diff-${trail.difficulty}">${difficultyLabel(trail.difficulty)}</span>
                    <span>⬆️ ${trail.elevationGainM} m</span>
                  </div>
                  <button class="icon-btn remove-favorite-btn" data-id="${trail.id}" title="Remove from favorites">🗑️</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Completed -->
        <div class="profile-section">
          <h2>✓ Completed (${completedTrails.length})</h2>
          ${completedTrails.length === 0 ? `
            <div class="empty-state">No completed trails yet. Go hiking!</div>
          ` : `
            <div class="profile-list">
              ${completedTrails.map(trail => `
                <div class="profile-item">
                  <div class="profile-item-info">
                    <strong>${trail.name}</strong>
                    <span class="diff-label diff-${trail.difficulty}">${difficultyLabel(trail.difficulty)}</span>
                    <span>⬆️ ${trail.elevationGainM} m</span>
                  </div>
                  <button class="icon-btn remove-completed-btn" data-id="${trail.id}" title="Remove from completed">🗑️</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `
    return
  }

  // ====================== HOME PAGE (existing code) ======================
  const depWeatherDesc = state.departureWeather ? getWeatherDescription(state.departureWeather.weather_code) : null

  const dateOptions = `
    <option value="" disabled ${!state.selectedDate ? 'selected' : ''}>${t('chooseDate')}</option>
    ${getNext10Days().map(d =>
      `<option value="${d}" ${d === state.selectedDate ? 'selected' : ''}>${formatDateLabel(d)}</option>`
    ).join('')}
  `

  const orderOptions = state.sortBy === 'weather'
    ? `<option value="asc">${t('better')}</option><option value="desc">${t('worse')}</option>`
    : `<option value="asc">${t('ascending')}</option><option value="desc">${t('descending')}</option>`

  app.innerHTML = `
    <div class="container">
      <div class="top-bar">
        <div class="lang-switcher">
          <button class="lang-btn ${state.lang === 'en' ? 'active' : ''}" data-lang="en">
            <img src="https://flagcdn.com/w40/gb.png" alt="EN" class="flag-icon"> EN
          </button>
          <button class="lang-btn ${state.lang === 'it' ? 'active' : ''}" data-lang="it">
            <img src="https://flagcdn.com/w40/it.png" alt="IT" class="flag-icon"> IT
          </button>
          <button class="lang-btn ${state.lang === 'de' ? 'active' : ''}" data-lang="de">
            <img src="https://flagcdn.com/w40/de.png" alt="DE" class="flag-icon"> DE
          </button>
        </div>

        <div class="auth-area">
          ${state.currentUser ? `
            <div class="notification-wrapper">
              <button id="notificationBtn" class="notification-btn" title="Notifications">
                🔔
                ${state.unreadCount > 0 ? `<span class="notification-badge">${state.unreadCount}</span>` : ''}
              </button>

              ${state.showNotifications ? `
                <div class="notifications-dropdown">
                  <div class="notifications-header">
                    <strong>Notifications</strong>
                    ${state.unreadCount > 0 ? `<button id="markAllReadBtn" class="link-btn">Mark all as read</button>` : ''}
                  </div>
                  <div class="notifications-list">
                    ${state.notifications.length === 0 ? `
                      <div class="no-notifications">No notifications yet</div>
                    ` : state.notifications.map(n => `
                      <div class="notification-item ${n.is_read ? 'read' : 'unread'}" data-id="${n.id}">
                        <div class="notification-title">${n.title}</div>
                        <div class="notification-message">${n.message}</div>
                        <div class="notification-time">${new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <button id="profileBtn" class="auth-btn user-name-btn">
              ${state.currentUser.user_metadata?.first_name || 'Profile'}
            </button>
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

      ${state.trailsLoading ? `
        <div class="no-results">${t('loadingTrails')}</div>
      ` : state.trailsError ? `
        <div class="no-results" style="color:#c53030">Error: ${state.trailsError}</div>
      ` : ''}

      ${state.showAuthModal ? `
        <div class="auth-modal-overlay">
          <div class="auth-modal">
            <button id="closeAuthModal" class="close-modal">✕</button>
            
            <h2>
              ${state.authMode === 'login' ? t('signIn') : 
                state.authMode === 'signup' ? t('createAccount') : 
                t('resetPassword')}
            </h2>

            ${state.authMode === 'signup' ? `
              <div class="auth-row">
                <input type="text" id="authFirstName" placeholder="${t('firstName')} *" value="${state.authFirstName}">
                <input type="text" id="authLastName" placeholder="${t('lastName')} *" value="${state.authLastName}">
              </div>
              <input type="text" id="authCity" placeholder="${t('city')}" value="${state.authCity}">
            ` : ''}

            <input type="email" id="authEmail" placeholder="${t('email')} *" value="${state.authEmail}">
            
            ${state.authMode !== 'forgot' ? `
              <input type="password" id="authPassword" placeholder="${t('password')} *" value="${state.authPassword}">
            ` : ''}

            ${state.authError ? `<div class="auth-error">${state.authError}</div>` : ''}
            ${state.authMessage ? `<div class="auth-message">${state.authMessage}</div>` : ''}

            <button id="authSubmitBtn" class="search-btn" ${state.authLoading ? 'disabled' : ''}>
              ${state.authLoading ? t('pleaseWait') : 
                state.authMode === 'login' ? t('signIn') : 
                state.authMode === 'signup' ? t('createAccount') : 
                t('sendResetLink')}
            </button>

            <div class="auth-links">
              ${state.authMode === 'login' ? `
                <button id="forgotPasswordBtn" class="link-btn">${t('forgotPassword')}</button>
                <p>${t('noAccount')} <button id="switchToSignup" class="link-btn">${t('createAccount')}</button></p>
              ` : state.authMode === 'signup' ? `
                <p>${t('hasAccount')} <button id="switchToLogin" class="link-btn">${t('signIn')}</button></p>
              ` : `
                <button id="switchToLogin" class="link-btn">${t('backToLogin')}</button>
              `}
            </div>
          </div>
        </div>
      ` : ''}

      <div class="filters">
        <div class="filter-group ${state.errors.departure ? 'error-field' : ''}" style="flex:1;min-width:220px;position:relative">
          <label>📍 ${t('departure')} *</label>
          <input type="text" id="departureInput" placeholder="${t('departure')}..." value="${state.inputValue}" autocomplete="off">
          <div class="suggestions-container"></div>
        </div>

        <div class="filter-group ${state.errors.date ? 'error-field' : ''}">
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
          <input type="number" id="maxDistance" placeholder="e.g. 25" value="${state.filters.maxDistance}" min="1" max="80">
        </div>

        <div class="filter-group">
          <label>⬆️ ${t('minElevation')}</label>
          <input type="number" id="minElevation" placeholder="e.g. 200" value="${state.filters.minElevation}" min="0" max="1500" step="50">
        </div>

        <div class="filter-group">
          <label>⬆️ ${t('maxElevation')}</label>
          <input type="number" id="maxElevation" placeholder="e.g. 1200" value="${state.filters.maxElevation}" min="50" max="2000" step="50">
        </div>

        <div class="filter-group ${state.errors.sortBy ? 'error-field' : ''}">
          <label>${t('sortBy')} *</label>
          <select id="sortBy">
            <option value="" disabled ${!state.sortBy ? 'selected' : ''}>${t('chooseSorting')}</option>
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
          <button id="searchBtn" class="search-btn" ${state.trailsLoading ? 'disabled' : ''}>🔍 ${t('search')}</button>
        </div>

        <div class="filter-group" style="align-self:end">
          <button id="resetBtn" class="reset-btn">${t('reset')}</button>
        </div>
      </div>

      ${state.departure.lat ? `
        <div class="selected-place-bar">
          <span>📍 ${t('startingFrom')}: <strong>${state.departure.name}</strong></span>
          <button id="clearDeparture" class="clear-btn">✕ ${t('clear')}</button>
        </div>
      ` : ''}

      ${state.hasSearched ? `
        <div class="weather-bar">
          ${state.weatherLoading ? `<div>${t('loading')}</div>` : state.departureWeather ? `
            <div class="weather-info">
              <span class="weather-date">${formatDateLabel(state.selectedDate)}</span>
              <span class="weather-main">${depWeatherDesc.icon} ${depWeatherDesc.text}</span>
              <span>🌡️ ${Math.round(state.departureWeather.temperature_2m_min)}° – ${Math.round(state.departureWeather.temperature_2m_max)}°C</span>
              <span>🌧️ ${state.departureWeather.precipitation_probability_max ?? 0}%</span>
              <span>💧 ${state.departureWeather.precipitation_sum ?? 0} mm</span>
            </div>
            <div class="weather-note">${t('weatherAtDeparture')}</div>
          ` : `<div>—</div>`}
        </div>
      ` : ''}

      <div class="results-info">
        ${!state.hasSearched ? t('fillRequired') : state.weatherLoading ? t('loading') : t('best10')}
      </div>

      <div class="trails-list">
        ${!state.hasSearched ? `
          <div class="no-results">${t('fillAndSearch')}</div>
        ` : state.results.length === 0 ? `
          <div class="no-results">${t('noResults')}</div>
        ` : state.results.map(trail => {
          const w = trail.dayWeather
          const desc = w ? getWeatherDescription(w.weather_code) : null
          const fav = isFavorite(trail.id)
          return `
            <div class="trail-card" data-url="${trail.guideUrl}" data-id="${trail.id}">
              <div class="card-header">
                <h3>${trail.name}</h3>
                <div class="card-actions">
                  <button class="icon-btn favorite-btn ${fav ? 'active' : ''}" data-id="${trail.id}" title="Favorite">
                    ${fav ? '❤️' : '🤍'}
                  </button>
                  <button class="icon-btn done-btn ${isCompleted(trail.id) ? 'active' : ''}" data-id="${trail.id}" title="Mark as done">
                    ✓
                  </button>
                  <span class="diff-label diff-${trail.difficulty}">${difficultyLabel(trail.difficulty)}</span>
                </div>
              </div>
              <div class="trail-meta">
                <span>📍 ${trail.area}</span>
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
}