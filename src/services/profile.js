import { state } from '../state.js'

export function getCompletedStats() {
  const completed = state.completed || []
  const trails = state.trails || []

  let list = completed.map(id => trails.find(t => t.id === id)).filter(Boolean)

  // Apply time filter (we will improve this later when we store real completion dates)
  // For now we just return all

  const totalCompleted = list.length
  const totalElevation = list.reduce((sum, t) => sum + (t.elevationGainM || 0), 0)

  return {
    totalCompleted,
    totalElevation
  }
}