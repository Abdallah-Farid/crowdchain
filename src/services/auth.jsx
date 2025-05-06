import { supabase } from './supabase'
import { setGlobalState, getGlobalState } from '../store'

export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Error signing up:', error.message)
      return { success: false, message: error.message }
    }

    setGlobalState('user', data.user)
    return { success: true, user: data.user }
  } catch (error) {
    console.error('Exception during sign up:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error signing in:', error.message)
      return { success: false, message: error.message }
    }

    setGlobalState('user', data.user)
    return { success: true, user: data.user }
  } catch (error) {
    console.error('Exception during sign in:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error.message)
      return { success: false, message: error.message }
    }

    setGlobalState('user', null)
    return { success: true }
  } catch (error) {
    console.error('Exception during sign out:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    // Handle missing session as no user
    if (error) {
      if (error.message.includes('Auth session missing')) {
        setGlobalState('user', null)
        return { success: false, user: null }
      }
      console.error('Error getting current user:', error.message)
      return { success: false, message: error.message }
    }
    if (data && data.user) {
      setGlobalState('user', data.user)
      return { success: true, user: data.user }
    }
    setGlobalState('user', null)
    return { success: false, user: null }
  } catch (error) {
    console.error('Exception getting current user:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    
    if (error) {
      console.error('Error resetting password:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Password reset email sent' }
  } catch (error) {
    console.error('Exception during password reset:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    
    if (error) {
      console.error('Error updating password:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Password updated successfully' }
  } catch (error) {
    console.error('Exception during password update:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
