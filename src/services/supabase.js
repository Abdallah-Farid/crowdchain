import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication functions
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  return { data, error }
}

// Database functions
export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getProject = async (id) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const createProjectRecord = async (projectData) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
  return { data, error }
}

export const updateProjectRecord = async (id, projectData) => {
  const { data, error } = await supabase
    .from('projects')
    .update(projectData)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteProjectRecord = async (id) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  return { error }
}

// Storage functions
export const uploadImage = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('project-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })
  return { data, error }
}

export const getImageUrl = (path) => {
  // Build public URL directly to ensure we hit the public endpoint
  return `${supabaseUrl}/storage/v1/object/public/project-images/${path}`
}
