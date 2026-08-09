import { supabase } from '../supabase.js'
import { state } from '../state.js'

export async function loadTrails() {
  state.trailsLoading = true
  state.trailsError = null

  const { data, error } = await supabase
    .from('trails')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error loading trails:', error)
    state.trailsError = error.message
    state.trailsLoading = false
    return
  }

  state.trails = data.map(t => ({
    id: t.id,
    name: t.name,
    area: t.area,
    difficulty: t.difficulty,
    distanceKm: Number(t.distance_km),
    elevationGainM: t.elevation_gain_m,
    startLat: Number(t.start_lat),
    startLon: Number(t.start_lon),
    description: t.description,
    guideUrl: t.guide_url
  }))

  state.trailsLoading = false
}