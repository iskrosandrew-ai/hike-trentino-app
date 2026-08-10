import { state } from '../state.js'
import { getStraightLineKm, getDrivingDistanceKm, calcSuitability, calcRecommendationScore, getRecommendationReason, difficultyValue } from '../utils/helpers.js'
import { fetchWeatherFor } from './weather.js'
import { trackEvent } from './analytics.js'

export async function fetchSuggestions(query) {
  if (query.length < 2) {
    state.suggestions = []
    state.showSuggestions = false
    return
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=${state.lang}&countryCode=IT`
    const res = await fetch(url)
    const data = await res.json()

    if (data.results) {
      state.suggestions = data.results.filter(p => {
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
      if (state.suggestions.length === 0) state.suggestions = data.results.slice(0, 6)
    } else {
      state.suggestions = []
    }
  } catch {
    state.suggestions = []
  }

  state.showSuggestions = true
}

export function selectPlace(place) {
  state.departure = {
    name: place.name + (place.admin1 ? `, ${place.admin1}` : ''),
    lat: place.latitude,
    lon: place.longitude
  }
  state.inputValue = state.departure.name
  state.suggestions = []
  state.showSuggestions = false
  state.errors.departure = false
}

export async function doSearch() {
  if (state.trailsLoading || state.trails.length === 0) return

  state.errors.departure = !state.departure.lat
  state.errors.date = !state.selectedDate
  state.errors.sortBy = !state.sortBy

  if (state.errors.departure || state.errors.date || state.errors.sortBy) {
    return false
  }

  state.weatherLoading = true
  state.hasSearched = true

  let list = state.trails.map(trail => {
    const straight = getStraightLineKm(state.departure.lat, state.departure.lon, trail.startLat, trail.startLon)
    return { ...trail, distanceFromDeparture: straight }
  })

  list = list.filter(t => {
    if (state.filters.difficulty !== 'all' && t.difficulty !== state.filters.difficulty) return false
    if (state.filters.minElevation && t.elevationGainM < Number(state.filters.minElevation)) return false
    if (state.filters.maxElevation && t.elevationGainM > Number(state.filters.maxElevation)) return false
    return true
  })

  list.sort((a, b) => a.distanceFromDeparture - b.distanceFromDeparture)
  const candidates = list.slice(0, 18)

  const distancePromises = candidates.map(t =>
    getDrivingDistanceKm(state.departure.lat, state.departure.lon, t.startLat, t.startLon)
  )
  const weatherPromises = [
    fetchWeatherFor(state.departure.lat, state.departure.lon, state.selectedDate),
    ...candidates.map(t => fetchWeatherFor(t.startLat, t.startLon, state.selectedDate))
  ]

  const [distances, allWeather] = await Promise.all([
    Promise.all(distancePromises),
    Promise.all(weatherPromises)
  ])

  state.departureWeather = allWeather[0]

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

  if (state.filters.maxDistance) {
    filtered = filtered.filter(t => t.distanceKmValue <= Number(state.filters.maxDistance))
  }

  if (state.sortBy === 'weather') {
    filtered.sort((a, b) => state.sortDir === 'asc' ? b.weatherScore - a.weatherScore : a.weatherScore - b.weatherScore)
  } else if (state.sortBy === 'distance') {
    filtered.sort((a, b) => state.sortDir === 'asc' ? a.distanceKmValue - b.distanceKmValue : b.distanceKmValue - a.distanceKmValue)
  } else if (state.sortBy === 'elevation') {
    filtered.sort((a, b) => state.sortDir === 'asc' ? a.elevationGainM - b.elevationGainM : b.elevationGainM - a.elevationGainM)
  } else if (state.sortBy === 'difficulty') {
    filtered.sort((a, b) => state.sortDir === 'asc' ? difficultyValue(a.difficulty) - difficultyValue(b.difficulty) : difficultyValue(b.difficulty) - difficultyValue(a.difficulty))
  } else {
    filtered.sort((a, b) => b.recommendationScore - a.recommendationScore)
  }

  state.results = filtered.slice(0, 10)
  state.weatherLoading = false

  // Track the search
  trackEvent('search_performed', {
    difficulty: state.filters.difficulty,
    max_distance: state.filters.maxDistance || null,
    min_elevation: state.filters.minElevation || null,
    max_elevation: state.filters.maxElevation || null,
    sort_by: state.sortBy,
    results_count: state.results.length,
    departure: state.departure.name
  })

  return true
}