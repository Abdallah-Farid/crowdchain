import { supabase } from './supabase'
import { setGlobalState, getGlobalState } from '../store'

// Function to sync blockchain project data with Supabase
export const syncProjectWithSupabase = async (project) => {
  try {
    // Check if project already exists in Supabase
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('blockchain_id', project.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching project:', fetchError.message)
      return { success: false, message: fetchError.message }
    }

    const projectData = {
      blockchain_id: project.id,
      owner: project.owner,
      title: project.title,
      description: project.description,
      image_url: project.imageURL,
      cost: project.cost,
      raised: project.raised,
      expires_at: new Date(project.expiresAt).toISOString(),
      backers_count: project.backers,
      status: project.status,
      has_milestones: project.hasMilestones,
      milestone_count: project.milestoneCount,
      milestones_completed: project.milestonesCompleted
    }

    let result
    if (existingProject) {
      // Update existing project
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('blockchain_id', project.id)
        .select()

      if (error) {
        console.error('Error updating project:', error.message)
        return { success: false, message: error.message }
      }
      result = { success: true, project: data[0] }
    } else {
      // Insert new project
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()

      if (error) {
        console.error('Error inserting project:', error.message)
        return { success: false, message: error.message }
      }
      result = { success: true, project: data[0] }
    }

    return result
  } catch (error) {
    console.error('Exception syncing project:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Function to sync blockchain milestone data with Supabase
export const syncMilestoneWithSupabase = async (projectId, milestone) => {
  try {
    // Check if milestone already exists in Supabase
    const { data: existingMilestone, error: fetchError } = await supabase
      .from('milestones')
      .select('*')
      .eq('blockchain_id', milestone.id)
      .eq('project_blockchain_id', projectId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching milestone:', fetchError.message)
      return { success: false, message: fetchError.message }
    }

    const milestoneData = {
      blockchain_id: milestone.id,
      project_blockchain_id: projectId,
      title: milestone.title,
      description: milestone.description,
      amount: milestone.amount,
      yes_votes: milestone.yesVotes,
      no_votes: milestone.noVotes,
      created_at: milestone.createdAt,
      completed_at: milestone.completedAt,
      status: milestone.status
    }

    let result
    if (existingMilestone) {
      // Update existing milestone
      const { data, error } = await supabase
        .from('milestones')
        .update(milestoneData)
        .eq('blockchain_id', milestone.id)
        .eq('project_blockchain_id', projectId)
        .select()

      if (error) {
        console.error('Error updating milestone:', error.message)
        return { success: false, message: error.message }
      }
      result = { success: true, milestone: data[0] }
    } else {
      // Insert new milestone
      const { data, error } = await supabase
        .from('milestones')
        .insert([milestoneData])
        .select()

      if (error) {
        console.error('Error inserting milestone:', error.message)
        return { success: false, message: error.message }
      }
      result = { success: true, milestone: data[0] }
    }

    return result
  } catch (error) {
    console.error('Exception syncing milestone:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Function to sync blockchain backer data with Supabase
export const syncBackerWithSupabase = async (projectId, backer) => {
  try {
    // Check if backer already exists in Supabase
    const { data: existingBacker, error: fetchError } = await supabase
      .from('backers')
      .select('*')
      .eq('owner', backer.owner)
      .eq('project_blockchain_id', projectId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching backer:', fetchError.message)
      return { success: false, message: fetchError.message }
    }

    const backerData = {
      owner: backer.owner,
      project_blockchain_id: projectId,
      refunded: backer.refunded,
      timestamp: backer.timestamp,
      contribution: backer.contribution
    }

    let result
    if (existingBacker) {
      // Update existing backer
      const { data, error } = await supabase
        .from('backers')
        .update(backerData)
        .eq('owner', backer.owner)
        .eq('project_blockchain_id', projectId)
        .select()

      if (error) {
        console.error('Error updating backer:', error.message)
        return { success: false, message: error.message }
      }
      result = { success: true, backer: data[0] }
    } else {
      // Insert new backer
      const { data, error } = await supabase
        .from('backers')
        .insert([backerData])
        .select()

      if (error) {
        console.error('Error inserting backer:', error.message)
        return { success: false, message: error.message }
      }
      result = { success: true, backer: data[0] }
    }

    return result
  } catch (error) {
    console.error('Exception syncing backer:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Function to get projects from Supabase
export const getProjectsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, projects: data }
  } catch (error) {
    console.error('Exception fetching projects:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Function to get a single project from Supabase
export const getProjectFromSupabase = async (blockchainId) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('blockchain_id', blockchainId)
      .single()

    if (error) {
      console.error('Error fetching project:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, project: data }
  } catch (error) {
    console.error('Exception fetching project:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Function to get milestones for a project from Supabase
export const getMilestonesFromSupabase = async (projectId) => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_blockchain_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching milestones:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, milestones: data }
  } catch (error) {
    console.error('Exception fetching milestones:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Function to get backers for a project from Supabase
export const getBackersFromSupabase = async (projectId) => {
  try {
    const { data, error } = await supabase
      .from('backers')
      .select('*')
      .eq('project_blockchain_id', projectId)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching backers:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, backers: data }
  } catch (error) {
    console.error('Exception fetching backers:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Function to upload project image to Supabase Storage
export const uploadProjectImage = async (file, projectId) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${projectId}-${Date.now()}.${fileExt}`
    const filePath = `project-images/${fileName}`

    const { data, error } = await supabase.storage
      .from('projects')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error.message)
      return { success: false, message: error.message }
    }

    const { data: urlData } = supabase.storage
      .from('projects')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Exception uploading image:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
