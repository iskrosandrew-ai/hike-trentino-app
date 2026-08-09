import { supabase } from '../supabase.js'
import { state } from '../state.js'

export async function loadCompleted() {
  if (!state.currentUser) {
    state.completed = []
    return
  }

  const { data, error } = await supabase
    .from('completed_trails')
    .select('trail_id')
    .eq('user_id', state.currentUser.id)

  if (error) {
    console.error('Error loading completed trails:', error)
    state.completed = []
    return
  }

  state.completed = data.map(c => c.trail_id)
}

export async function toggleCompleted(trailId) {
  if (!state.currentUser) {
    return { needsLogin: true }
  }

  const isDone = state.completed.includes(trailId)

  if (isDone) {
    // Remove from completed
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
  } else {
    // Add to completed
    const { error } = await supabase
      .from('completed_trails')
      .insert({
        user_id: state.currentUser.id,
        trail_id: trailId,
        completed_at: new Date().toISOString().slice(0, 10)
      })

    if (error) {
      console.error('Error adding completed trail:', error)
      return { error: true }
    }

    state.completed.push(trailId)
  }

  return { success: true }
}

export function isCompleted(trailId) {
  return state.completed.includes(trailId)
}