import { supabase } from '../supabase.js'
import { state } from '../state.js'

export async function loadCompleted() {
  if (!state.currentUser) {
    state.completed = []
    return
  }

  const { data, error } = await supabase
    .from('completed_trails')
    .select('trail_id, completed_at, note')
    .eq('user_id', state.currentUser.id)

  if (error) {
    console.error('Error loading completed trails:', error)
    state.completed = []
    return
  }

  state.completed = data.map(c => c.trail_id)
  // We keep the full data for later if needed
  state.completedDetails = data || []
}

export function isCompleted(trailId) {
  return state.completed.includes(trailId)
}

export async function openCompletedModal(trailId) {
  if (!state.currentUser) {
    return { needsLogin: true }
  }

  // If already completed → just remove it
  if (state.completed.includes(trailId)) {
    const { error } = await supabase
      .from('completed_trails')
      .delete()
      .eq('user_id', state.currentUser.id)
      .eq('trail_id', trailId)

    if (error) {
      console.error('Error removing completed trail:', error)
      return { error: true }
    }

    state.completed = state.completed.filter(id => id !== trailId)
    return { success: true, removed: true }
  }

  // Not completed yet → open the modal
  state.completedTrailId = trailId
  state.completedDate = new Date().toISOString().slice(0, 10) // today
  state.completedNote = ''
  state.showCompletedModal = true
  return { success: true, openModal: true }
}

export async function saveCompleted() {
  if (!state.currentUser || !state.completedTrailId) return { error: true }

  const { error } = await supabase
    .from('completed_trails')
    .insert({
      user_id: state.currentUser.id,
      trail_id: state.completedTrailId,
      completed_at: state.completedDate,
      note: state.completedNote.trim() || null
    })

  if (error) {
    console.error('Error saving completed trail:', error)
    return { error: true }
  }

  state.completed.push(state.completedTrailId)
  state.showCompletedModal = false
  state.completedTrailId = null
  state.completedNote = ''
  return { success: true }
}

export function closeCompletedModal() {
  state.showCompletedModal = false
  state.completedTrailId = null
  state.completedNote = ''
}