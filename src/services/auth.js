import { supabase } from '../supabase.js'
import { state } from '../state.js'

export async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser()
  state.currentUser = user
}

export async function handleLogin() {
  state.authLoading = true
  state.authError = ''
  state.authMessage = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: state.authEmail,
    password: state.authPassword
  })

  state.authLoading = false

  if (error) {
    state.authError = error.message
    return false
  }

  state.showAuthModal = false
  resetAuthForm()
  await checkUser()
  return true
}

export async function handleSignup() {
  if (!state.authFirstName.trim() || !state.authLastName.trim()) {
    state.authError = 'First name and Last name are required'
    return false
  }

  state.authLoading = true
  state.authError = ''
  state.authMessage = ''

  const { error } = await supabase.auth.signUp({
    email: state.authEmail,
    password: state.authPassword,
    options: {
      data: {
        first_name: state.authFirstName.trim(),
        last_name: state.authLastName.trim(),
        city: state.authCity.trim() || null
      }
    }
  })

  state.authLoading = false

  if (error) {
    state.authError = error.message
    return false
  }

  state.authMessage = 'Account created! Please check your email to confirm.'
  state.authMode = 'login'
  return true
}

export async function handleForgotPassword() {
  if (!state.authEmail.trim()) {
    state.authError = 'Please enter your email'
    return false
  }

  state.authLoading = true
  state.authError = ''
  state.authMessage = ''

  const { error } = await supabase.auth.resetPasswordForEmail(state.authEmail, {
    redirectTo: window.location.origin
  })

  state.authLoading = false

  if (error) {
    state.authError = error.message
    return false
  }

  state.authMessage = 'Password reset link sent! Check your email.'
  return true
}

export async function handleLogout() {
  await supabase.auth.signOut()
  state.currentUser = null
  state.favorites = []
  state.completed = []
}

export function resetAuthForm() {
  state.authEmail = ''
  state.authPassword = ''
  state.authFirstName = ''
  state.authLastName = ''
  state.authCity = ''
  state.authError = ''
  state.authMessage = ''
}