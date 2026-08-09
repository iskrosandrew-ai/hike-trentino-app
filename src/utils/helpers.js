import { state } from '../state.js'
import { translations } from '../i18n/translations.js'

export function t(key) {
  return translations[state.lang][key] || translations.en[key] || key
}

export function getNext10Days() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 10; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function formatDateLabel(iso) {
  const d = new Date(iso + 'T12:00:00')
  const locale = state.lang === 'it' ? 'it-IT' : state.lang === 'de' ? 'de-DE' : 'en-GB'
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function getStraightLineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function getDrivingDistanceKm(lat1, lon1, lat2, lon2) {
  const key = `${lat1.toFixed(3)},${lon1.toFixed(3)}_${lat2.toFixed(3)},${lon2.toFixed(3)}`
  if (state.distanceCache[key]) return state.distanceCache[key]

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
    const res = await fetch(url)
    const data = await res.json()

    if (data.code === 'Ok' && data.routes?.[0]) {
      const km = data.routes[0].distance / 1000
      state.distanceCache[key] = { km, isDriving: true }
      return state.distanceCache[key]
    }
  } catch (err) {
    console.warn('Driving distance failed', err)
  }

  const km = getStraightLineKm(lat1, lon1, lat2, lon2)
  state.distanceCache[key] = { km, isDriving: false }
  return state.distanceCache[key]
}

export function getWeatherDescription(code) {
  if (code === 0) return { text: state.lang === 'it' ? 'Cielo sereno' : state.lang === 'de' ? 'Klarer Himmel' : 'Clear sky', icon: '☀️' }
  if (code === 1) return { text: state.lang === 'it' ? 'Prevalentemente sereno' : state.lang === 'de' ? 'Überwiegend klar' : 'Mainly clear', icon: '🌤️' }
  if (code === 2) return { text: state.lang === 'it' ? 'Parzialmente nuvoloso' : state.lang === 'de' ? 'Teilweise bewölkt' : 'Partly cloudy', icon: '⛅' }
  if (code === 3) return { text: state.lang === 'it' ? 'Coperto' : state.lang === 'de' ? 'Bedeckt' : 'Overcast', icon: '☁️' }
  if (code >= 45 && code <= 48) return { text: state.lang === 'it' ? 'Nebbia' : state.lang === 'de' ? 'Nebel' : 'Foggy', icon: '🌫️' }
  if (code >= 51 && code <= 57) return { text: state.lang === 'it' ? 'Pioggerella' : state.lang === 'de' ? 'Nieselregen' : 'Drizzle', icon: '🌦️' }
  if (code >= 61 && code <= 67) return { text: state.lang === 'it' ? 'Pioggia' : state.lang === 'de' ? 'Regen' : 'Rain', icon: '🌧️' }
  if (code >= 71 && code <= 77) return { text: state.lang === 'it' ? 'Neve' : state.lang === 'de' ? 'Schnee' : 'Snow', icon: '❄️' }
  if (code >= 80 && code <= 82) return { text: state.lang === 'it' ? 'Rovesci' : state.lang === 'de' ? 'Regenschauer' : 'Rain showers', icon: '🌦️' }
  if (code >= 85 && code <= 86) return { text: state.lang === 'it' ? 'Rovesci di neve' : state.lang === 'de' ? 'Schneeschauer' : 'Snow showers', icon: '🌨️' }
  if (code >= 95) return { text: state.lang === 'it' ? 'Temporale' : state.lang === 'de' ? 'Gewitter' : 'Thunderstorm', icon: '⛈️' }
  return { text: state.lang === 'it' ? 'Variabile' : state.lang === 'de' ? 'Wechselhaft' : 'Variable', icon: '🌡️' }
}

export function calcSuitability(day) {
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

export function calcRecommendationScore(trail) {
  const weatherScore = trail.weatherScore ?? 50
  const distance = trail.distanceKmValue ?? 30
  let distanceScore = Math.max(0, 100 - (distance * 2.5))
  let elevationScore = 70
  if (trail.elevationGainM >= 300 && trail.elevationGainM <= 900) elevationScore = 90
  else if (trail.elevationGainM > 1200) elevationScore = 50
  return Math.round((weatherScore * 0.5) + (distanceScore * 0.35) + (elevationScore * 0.15))
}

export function getRecommendationReason(trail) {
  const reasons = []
  if (trail.weatherScore >= 75) reasons.push(t('greatWeather'))
  else if (trail.weatherScore >= 60) reasons.push(t('goodWeather'))
  if (trail.distanceKmValue <= 15) reasons.push(t('close'))
  else if (trail.distanceKmValue <= 25) reasons.push(t('nearby'))
  if (trail.elevationGainM >= 300 && trail.elevationGainM <= 900) reasons.push(t('niceElevation'))
  if (reasons.length === 0) return t('matchesFilters')
  return reasons.join(' · ')
}

export function difficultyLabel(d) {
  if (d === 'T') return t('easy')
  if (d === 'E') return t('moderate')
  if (d === 'EE') return t('hard')
  if (d === 'EEA') return t('expert')
  return d
}

export function difficultyValue(d) {
  if (d === 'T') return 1
  if (d === 'E') return 2
  if (d === 'EE') return 3
  if (d === 'EEA') return 4
  return 0
}

export function cacheKey(lat, lon, date) {
  return `${lat.toFixed(3)},${lon.toFixed(3)},${date}`
}