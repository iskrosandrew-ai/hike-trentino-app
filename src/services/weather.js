import { state } from '../state.js'
import { cacheKey } from '../utils/helpers.js'

export async function fetchWeatherFor(lat, lon, date) {
  const key = cacheKey(lat, lon, date)
  if (state.weatherCache[key]) return state.weatherCache[key]

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
      state.weatherCache[key] = day
      return day
    }
  } catch (err) {
    console.error(err)
  }
  return null
}