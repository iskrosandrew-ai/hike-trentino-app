import { state } from '../state.js'

export function getCompletedStats() {
  const details = state.completedDetails || []
  const trails = state.trails || []

  let filtered = details

  // Apply date range filter
  if (state.statsFrom) {
    filtered = filtered.filter(item => item.completed_at >= state.statsFrom)
  }
  if (state.statsTo) {
    filtered = filtered.filter(item => item.completed_at <= state.statsTo)
  }

  const trailIds = filtered.map(item => item.trail_id)
  const list = trails.filter(t => trailIds.includes(t.id))

  const totalCompleted = list.length
  const totalElevation = list.reduce((sum, t) => sum + (t.elevationGainM || 0), 0)

  return {
    totalCompleted,
    totalElevation
  }
}