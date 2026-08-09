import { supabase } from '../supabase.js'
import { state } from '../state.js'

export async function loadFavorites() {
  if (!state.currentUser) {
    state.favorites = []
    return
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('trail_id')
    .eq('user_id', state.currentUser.id)

  if (error) {
    console.error('Error loading favorites:', error)
    state.favorites = []
    return
  }

  state.favorites = data.map(f => f.trail_id)
}

export async function toggleFavorite(trailId) {
  // If user is not logged in → return a special flag
  if (!state.currentUser) {
    return { needsLogin: true }
  }

  const isFavorite = state.favorites.includes(trailId)

  if (isFavorite) {
    // Remove from favorites
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', state.currentUser.id)
      .eq('trail_id', trailId)

    if (error) {
      console.error('Error removing favorite:', error)
      return { error: true }
    }

    state.favorites = state.favorites.filter(id => id !== trailId)
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: state.currentUser.id,
        trail_id: trailId
      })

    if (error) {
      console.error('Error adding favorite:', error)
      return { error: true }
    }

    state.favorites.push(trailId)
  }

  return { success: true }
}

export function isFavorite(trailId) {
  return state.favorites.includes(trailId)
}