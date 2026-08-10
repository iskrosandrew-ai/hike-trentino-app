import { supabase } from '../supabase.js'
import { state } from '../state.js'

export async function loadNotifications() {
  if (!state.currentUser) {
    state.notifications = []
    state.unreadCount = 0
    return
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', state.currentUser.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('Error loading notifications:', error)
    state.notifications = []
    state.unreadCount = 0
    return
  }

  state.notifications = data || []
  state.unreadCount = state.notifications.filter(n => !n.is_read).length
}

export async function markAsRead(notificationId) {
  if (!state.currentUser) return

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', state.currentUser.id)

  if (error) {
    console.error('Error marking notification as read:', error)
    return
  }

  // Update local state
  const notif = state.notifications.find(n => n.id === notificationId)
  if (notif) notif.is_read = true
  state.unreadCount = state.notifications.filter(n => !n.is_read).length
}

export async function markAllAsRead() {
  if (!state.currentUser) return

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', state.currentUser.id)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all as read:', error)
    return
  }

  state.notifications.forEach(n => n.is_read = true)
  state.unreadCount = 0
}