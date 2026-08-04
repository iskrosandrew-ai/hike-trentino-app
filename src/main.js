import './style.css';
import { trails } from './data/trails.js';

const app = document.querySelector('#app');

// ---------- State ----------
let filters = {
  difficulty: 'all',
  maxDistance: '',
  minElevation: '',
  maxElevation: '',
};

let departure = { name: '', lat: null, lon: null };
let inputValue = '';
let suggestions = [];
let showSuggestions = false;

let selectedDate = '';
let weatherLoading = false;
let hasSearched = false;

let sortBy = '';
let sortDir = 'asc';

let results = [];
let departureWeather = null;

let errors = {
  departure: false,
  date: false,
  sortBy: false,
};

const weatherCache = {};
const distanceCache = {}; // cache for driving distances

// ---------- Helpers ----------
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getNext10Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDateLabel(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function getStraightLineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Real driving distance using free OSRM
async function getDrivingDistanceKm(lat1, lon1, lat2, lon2) {
  const key = `${lat1.toFixed(3)},${lon1.toFixed(3)}_${lat2.toFixed(
    3
  )},${lon2.toFixed(3)}`;
  if (distanceCache[key]) return distanceCache[key];

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const km = data.routes[0].distance / 1000;
      distanceCache[key] = { km, isDriving: true };
      return distanceCache[key];
    }
  } catch (err) {
    console.warn('Driving distance failed, using straight line', err);
  }

  // Fallback
  const km = getStraightLineKm(lat1, lon1, lat2, lon2);
  distanceCache[key] = { km, isDriving: false };
  return distanceCache[key];
}

function getWeatherDescription(code) {
  if (code === 0) return { text: 'Clear sky', icon: '☀️' };
  if (code === 1) return { text: 'Mainly clear', icon: '🌤️' };
  if (code === 2) return { text: 'Partly cloudy', icon: '⛅' };
  if (code === 3) return { text: 'Overcast', icon: '☁️' };
  if (code >= 45 && code <= 48) return { text: 'Foggy', icon: '🌫️' };
  if (code >= 51 && code <= 57) return { text: 'Drizzle', icon: '🌦️' };
  if (code >= 61 && code <= 67) return { text: 'Rain', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { text: 'Snow', icon: '❄️' };
  if (code >= 80 && code <= 82) return { text: 'Rain showers', icon: '🌦️' };
  if (code >= 85 && code <= 86) return { text: 'Snow showers', icon: '🌨️' };
  if (code >= 95) return { text: 'Thunderstorm', icon: '⛈️' };
  return { text: 'Variable', icon: '🌡️' };
}

function calcSuitability(day) {
  if (!day) return 50;
  let score = 100;
  score -= (day.precipitation_probability_max ?? 0) * 0.7;
  const precip = day.precipitation_sum ?? 0;
  if (precip > 5) score -= 25;
  else if (precip > 1) score -= 10;
  const code = day.weather_code ?? 0;
  if (code >= 80) score -= 30;
  else if (code >= 61) score -= 20;
  else if (code >= 51) score -= 10;
  else if (code >= 45) score -= 8;
  else if (code > 3) score -= 5;
  const maxT = day.temperature_2m_max ?? 15;
  if (maxT < 5) score -= 25;
  else if (maxT < 10) score -= 12;
  else if (maxT > 28) score -= 15;
  else if (maxT > 24) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calcRecommendationScore(trail) {
  const weatherScore = trail.weatherScore ?? 50;
  const distance = trail.distanceKmValue ?? 30;

  let distanceScore = Math.max(0, 100 - distance * 2.5);
  let elevationScore = 70;
  if (trail.elevationGainM >= 300 && trail.elevationGainM <= 900)
    elevationScore = 90;
  else if (trail.elevationGainM > 1200) elevationScore = 50;

  return Math.round(
    weatherScore * 0.5 + distanceScore * 0.35 + elevationScore * 0.15
  );
}

function getRecommendationReason(trail) {
  const reasons = [];
  if (trail.weatherScore >= 75) reasons.push('Great weather');
  else if (trail.weatherScore >= 60) reasons.push('Good weather');

  if (trail.distanceKmValue <= 15) reasons.push('Close');
  else if (trail.distanceKmValue <= 25) reasons.push('Nearby');

  if (trail.elevationGainM >= 300 && trail.elevationGainM <= 900)
    reasons.push('Nice elevation');

  if (reasons.length === 0) return 'Matches your filters';
  return reasons.join(' · ');
}

function difficultyLabel(d) {
  if (d === 'T') return 'Easy';
  if (d === 'E') return 'Moderate';
  if (d === 'EE') return 'Hard';
  if (d === 'EEA') return 'Expert';
  return d;
}

function difficultyValue(d) {
  if (d === 'T') return 1;
  if (d === 'E') return 2;
  if (d === 'EE') return 3;
  if (d === 'EEA') return 4;
  return 0;
}

function cacheKey(lat, lon, date) {
  return `${lat.toFixed(3)},${lon.toFixed(3)},${date}`;
}

// ---------- Weather ----------
async function fetchWeatherFor(lat, lon, date) {
  const key = cacheKey(lat, lon, date);
  if (weatherCache[key]) return weatherCache[key];

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=10`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.warn('Weather API:', data.reason);
      return null;
    }

    if (data.daily && data.daily.time) {
      let idx = data.daily.time.indexOf(date);
      if (idx === -1) idx = 0;

      const day = {
        weather_code: data.daily.weather_code[idx],
        temperature_2m_max: data.daily.temperature_2m_max[idx],
        temperature_2m_min: data.daily.temperature_2m_min[idx],
        precipitation_sum: data.daily.precipitation_sum[idx],
        precipitation_probability_max:
          data.daily.precipitation_probability_max[idx],
      };
      weatherCache[key] = day;
      return day;
    }
  } catch (err) {
    console.error(err);
  }
  return null;
}

// ---------- Search ----------
async function doSearch() {
  errors.departure = !departure.lat;
  errors.date = !selectedDate;
  errors.sortBy = !sortBy;

  if (errors.departure || errors.date || errors.sortBy) {
    render();
    return;
  }

  weatherLoading = true;
  hasSearched = true;
  render();

  // 1. Basic filter + straight-line for first sorting
  let list = trails.map((trail) => {
    const straight = getStraightLineKm(
      departure.lat,
      departure.lon,
      trail.startLat,
      trail.startLon
    );
    return { ...trail, distanceFromDeparture: straight };
  });

  list = list.filter((t) => {
    if (filters.difficulty !== 'all' && t.difficulty !== filters.difficulty)
      return false;
    if (filters.maxDistance && t.distanceKm > Number(filters.maxDistance))
      return false;
    if (filters.minElevation && t.elevationGainM < Number(filters.minElevation))
      return false;
    if (filters.maxElevation && t.elevationGainM > Number(filters.maxElevation))
      return false;
    return true;
  });

  list.sort((a, b) => a.distanceFromDeparture - b.distanceFromDeparture);
  const candidates = list.slice(0, 15);

  // 2. Get real driving distance + weather in parallel
  const distancePromises = candidates.map((t) =>
    getDrivingDistanceKm(departure.lat, departure.lon, t.startLat, t.startLon)
  );
  const weatherPromises = [
    fetchWeatherFor(departure.lat, departure.lon, selectedDate),
    ...candidates.map((t) =>
      fetchWeatherFor(t.startLat, t.startLon, selectedDate)
    ),
  ];

  const [distances, ...weatherResults] = await Promise.all([
    Promise.all(distancePromises),
    ...weatherPromises,
  ]);

  // Fix: weatherResults structure
  const allWeather = await Promise.all(weatherPromises);
  departureWeather = allWeather[0];

  candidates.forEach((t, i) => {
    const dist = distances[i];
    t.distanceKmValue = dist.km;
    t.isDrivingDistance = dist.isDriving;
    t.dayWeather = allWeather[i + 1];
    t.weatherScore = calcSuitability(t.dayWeather);
    t.recommendationScore = calcRecommendationScore(t);
    t.reason = getRecommendationReason(t);
  });

  // 3. Final sort
  if (sortBy === 'weather') {
    candidates.sort((a, b) =>
      sortDir === 'asc'
        ? a.weatherScore - b.weatherScore
        : b.weatherScore - a.weatherScore
    );
  } else if (sortBy === 'distance') {
    candidates.sort((a, b) =>
      sortDir === 'asc'
        ? a.distanceKmValue - b.distanceKmValue
        : b.distanceKmValue - a.distanceKmValue
    );
  } else if (sortBy === 'elevation') {
    candidates.sort((a, b) =>
      sortDir === 'asc'
        ? a.elevationGainM - b.elevationGainM
        : b.elevationGainM - a.elevationGainM
    );
  } else if (sortBy === 'difficulty') {
    candidates.sort((a, b) =>
      sortDir === 'asc'
        ? difficultyValue(a.difficulty) - difficultyValue(b.difficulty)
        : difficultyValue(b.difficulty) - difficultyValue(a.difficulty)
    );
  } else {
    candidates.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  results = candidates.slice(0, 10);
  weatherLoading = false;
  render();
}

// ---------- Geocoding ----------
async function fetchSuggestions(query) {
  if (query.length < 2) {
    suggestions = [];
    showSuggestions = false;
    updateSuggestionsOnly();
    return;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=8&language=it&countryCode=IT`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.results) {
      suggestions = data.results.filter((p) => {
        const admin = (p.admin1 || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return (
          admin.includes('trentino') ||
          admin.includes('bolzano') ||
          admin.includes('south tyrol') ||
          admin.includes('alto adige') ||
          name.includes('trento') ||
          name.includes('bolzano') ||
          name.includes('merano') ||
          name.includes('riva') ||
          name.includes('madonna') ||
          name.includes('canazei') ||
          name.includes('moena') ||
          name.includes('cavalese') ||
          name.includes('predazzo') ||
          name.includes('pinzolo') ||
          name.includes('campiglio') ||
          name.includes('molveno') ||
          name.includes('levico') ||
          name.includes('pergine') ||
          name.includes('rovereto') ||
          name.includes('garzano')
        );
      });
      if (suggestions.length === 0) suggestions = data.results.slice(0, 6);
    } else {
      suggestions = [];
    }
  } catch {
    suggestions = [];
  }

  showSuggestions = true;
  updateSuggestionsOnly();
}

function selectPlace(place) {
  departure = {
    name: place.name + (place.admin1 ? `, ${place.admin1}` : ''),
    lat: place.latitude,
    lon: place.longitude,
  };
  inputValue = departure.name;
  suggestions = [];
  showSuggestions = false;
  errors.departure = false;
  render();
}

function updateSuggestionsOnly() {
  const container = document.querySelector('.suggestions-container');
  if (!container) return;

  if (showSuggestions && suggestions.length > 0) {
    container.innerHTML = `
      <div class="suggestions">
        ${suggestions
          .map(
            (s, i) => `
          <div class="suggestion-item" data-index="${i}">
            ${s.name}${s.admin1 ? `, ${s.admin1}` : ''}
          </div>
        `
          )
          .join('')}
      </div>`;
    document.querySelectorAll('.suggestion-item').forEach((item) => {
      item.addEventListener('click', () => {
        selectPlace(suggestions[Number(item.dataset.index)]);
      });
    });
  } else {
    container.innerHTML = '';
  }
}

// ---------- Render ----------
function render() {
  const depWeatherDesc = departureWeather
    ? getWeatherDescription(departureWeather.weather_code)
    : null;

  const dateOptions = `
    <option value="" disabled ${
      !selectedDate ? 'selected' : ''
    }>Choose a date...</option>
    ${getNext10Days()
      .map(
        (d) =>
          `<option value="${d}" ${
            d === selectedDate ? 'selected' : ''
          }>${formatDateLabel(d)}</option>`
      )
      .join('')}
  `;

  app.innerHTML = `
    <div class="container">
      <header>
        <h1>🏔️ Hike Trentino</h1>
        <p>Discover the best hiking trails in Trentino</p>
      </header>

      <div class="filters">
        <div class="filter-group ${
          errors.departure ? 'error-field' : ''
        }" style="flex:1;min-width:220px;position:relative">
          <label>📍 Departure place *</label>
          <input type="text" id="departureInput" placeholder="Type a place in Trentino..." value="${inputValue}" autocomplete="off">
          <div class="suggestions-container"></div>
        </div>

        <div class="filter-group ${errors.date ? 'error-field' : ''}">
          <label>📅 Date *</label>
          <select id="dateSelect">${dateOptions}</select>
        </div>

        <div class="filter-group">
          <label>Difficulty</label>
          <select id="difficulty">
            <option value="all">All levels</option>
            <option value="T">Easy (T)</option>
            <option value="E">Moderate (E)</option>
            <option value="EE">Hard (EE)</option>
            <option value="EEA">Expert (EEA)</option>
          </select>
        </div>

        <div class="filter-group">
          <label>📏 Max Distance (km)</label>
          <input type="number" id="maxDistance" placeholder="e.g. 15" value="${
            filters.maxDistance
          }" min="1" max="40">
        </div>

        <div class="filter-group">
          <label>⬆️ Min Elevation (m)</label>
          <input type="number" id="minElevation" placeholder="e.g. 200" value="${
            filters.minElevation
          }" min="0" max="1500" step="50">
        </div>

        <div class="filter-group">
          <label>⬆️ Max Elevation (m)</label>
          <input type="number" id="maxElevation" placeholder="e.g. 1200" value="${
            filters.maxElevation
          }" min="50" max="2000" step="50">
        </div>

        <div class="filter-group ${errors.sortBy ? 'error-field' : ''}">
          <label>Sort by *</label>
          <select id="sortBy">
            <option value="" disabled ${
              !sortBy ? 'selected' : ''
            }>Choose sorting...</option>
            <option value="distance">Distance</option>
            <option value="weather">Weather</option>
            <option value="elevation">Elevation</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Order</label>
          <select id="sortDir">
            <option value="asc">Ascending ↑</option>
            <option value="desc">Descending ↓</option>
          </select>
        </div>

        <div class="filter-group" style="align-self:end">
          <button id="searchBtn" class="search-btn">🔍 Search</button>
        </div>

        <div class="filter-group" style="align-self:end">
          <button id="resetBtn" class="reset-btn">Reset</button>
        </div>
      </div>

      ${
        departure.lat
          ? `
        <div class="selected-place-bar">
          <span>📍 Starting from: <strong>${departure.name}</strong></span>
          <button id="clearDeparture" class="clear-btn">✕ Clear</button>
        </div>
      `
          : ''
      }

      ${
        hasSearched
          ? `
        <div class="weather-bar">
          ${
            weatherLoading
              ? `
            <div>Loading weather and distances…</div>
          `
              : departureWeather
              ? `
            <div class="weather-info">
              <span class="weather-date">${formatDateLabel(selectedDate)}</span>
              <span class="weather-main">${depWeatherDesc.icon} ${
                  depWeatherDesc.text
                }</span>
              <span>🌡️ ${Math.round(
                departureWeather.temperature_2m_min
              )}° – ${Math.round(departureWeather.temperature_2m_max)}°C</span>
              <span>🌧️ Rain chance: ${
                departureWeather.precipitation_probability_max ?? 0
              }%</span>
              <span>💧 ${departureWeather.precipitation_sum ?? 0} mm</span>
            </div>
            <div class="weather-note">Weather at departure place</div>
          `
              : `
            <div>Could not load departure weather</div>
          `
          }
        </div>
      `
          : ''
      }

      <div class="results-info">
        ${
          !hasSearched
            ? 'Fill the required fields (*) and click Search'
            : weatherLoading
            ? 'Searching, loading weather and driving distances…'
            : `Best 10 options based on your filters`
        }
      </div>

      <div class="trails-list">
        ${
          !hasSearched
            ? `
          <div class="no-results">Fill Departure, Date and Sort by, then click Search</div>
        `
            : results.length === 0
            ? `
          <div class="no-results">No trails match your filters</div>
        `
            : results
                .map((trail) => {
                  const w = trail.dayWeather;
                  const desc = w ? getWeatherDescription(w.weather_code) : null;
                  const distLabel = trail.isDrivingDistance
                    ? `🚗 ${trail.distanceKmValue.toFixed(1)} km drive`
                    : `📏 ${trail.distanceKmValue.toFixed(1)} km straight-line`;
                  return `
            <div class="trail-card" data-url="${trail.guideUrl}">
              <div class="card-header">
                <h3>${trail.name}</h3>
                <span class="diff-label diff-${
                  trail.difficulty
                }">${difficultyLabel(trail.difficulty)}</span>
              </div>
              <div class="trail-meta">
                <span>📍 ${trail.area}</span>
                <span>📏 ${trail.distanceKm} km</span>
                <span>⬆️ ${trail.elevationGainM} m</span>
                <span class="distance">${distLabel}</span>
              </div>
              ${
                w
                  ? `
                <div class="card-weather">
                  ${desc.icon} <strong>${desc.text}</strong>
                  · ${Math.round(w.temperature_2m_min)}–${Math.round(
                      w.temperature_2m_max
                    )}°C
                  · Rain ${w.precipitation_probability_max ?? 0}%
                </div>
              `
                  : `
                <div class="card-weather loading">Weather not available</div>
              `
              }
              <div class="reason">${trail.reason}</div>
              <p>${trail.description}</p>
              <div class="card-hint">Click to open guide →</div>
            </div>
          `;
                })
                .join('')
        }
      </div>

      <footer class="credits">
        <strong>Hike Trentino</strong> · Created by <strong>Andrew Iskros</strong><br>
        Weather data: Open-Meteo · Trail info: Visit Trentino
      </footer>
    </div>
  `;

  // Events
  document.getElementById('difficulty').value = filters.difficulty;
  document.getElementById('difficulty').addEventListener('change', (e) => {
    filters.difficulty = e.target.value;
  });

  document.getElementById('maxDistance').addEventListener('change', (e) => {
    filters.maxDistance = e.target.value;
  });
  document.getElementById('minElevation').addEventListener('change', (e) => {
    filters.minElevation = e.target.value;
  });
  document.getElementById('maxElevation').addEventListener('change', (e) => {
    filters.maxElevation = e.target.value;
  });

  document.getElementById('sortBy').value = sortBy;
  document.getElementById('sortBy').addEventListener('change', (e) => {
    sortBy = e.target.value;
    errors.sortBy = false;
  });

  document.getElementById('sortDir').value = sortDir;
  document.getElementById('sortDir').addEventListener('change', (e) => {
    sortDir = e.target.value;
  });

  document.getElementById('dateSelect').addEventListener('change', (e) => {
    selectedDate = e.target.value;
    errors.date = false;
  });

  document.getElementById('searchBtn').addEventListener('click', () => {
    doSearch();
  });

  const clearBtn = document.getElementById('clearDeparture');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      departure = { name: '', lat: null, lon: null };
      inputValue = '';
      departureWeather = null;
      hasSearched = false;
      results = [];
      render();
    });
  }

  document.getElementById('resetBtn').addEventListener('click', () => {
    filters = {
      difficulty: 'all',
      maxDistance: '',
      minElevation: '',
      maxElevation: '',
    };
    departure = { name: '', lat: null, lon: null };
    inputValue = '';
    selectedDate = '';
    sortBy = '';
    sortDir = 'asc';
    hasSearched = false;
    results = [];
    departureWeather = null;
    errors = { departure: false, date: false, sortBy: false };
    render();
  });

  const input = document.getElementById('departureInput');
  let timer;
  input.addEventListener('input', (e) => {
    inputValue = e.target.value;
    clearTimeout(timer);
    timer = setTimeout(() => fetchSuggestions(inputValue), 300);
  });

  document.querySelectorAll('.trail-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.dataset.url) window.open(card.dataset.url, '_blank');
    });
  });

  updateSuggestionsOnly();
}

render();
