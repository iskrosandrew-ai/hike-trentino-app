import { supabase } from '../supabase.js'
import { state } from '../state.js'

// Generate or get anonymous ID (stays in the browser)
function getAnonymousId() {
  let id = localStorage.getItem('hike_anonymous_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('hike_anonymous_id', id)
  }
  return id
}

/**
 * Track any event
 * @param {string} eventName - e.g. "app_opened", "search", "trail_clicked"
 * @param {object} properties - extra data (filters, trail id, etc.)
 */
export async function trackEvent(eventName, properties = {}) {
  try {
    await supabase.functions.invoke('track-event', {
      body: {
        event_name: eventName,
        properties,
        anonymous_id: getAnonymousId(),
        language: state.lang || 'en'
      }
    })
  } catch (err) {
    // Never break the app if tracking fails
    console.warn('Tracking failed:', err)
  }
}