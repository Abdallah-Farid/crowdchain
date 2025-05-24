import { supabase } from './supabase'
import { setGlobalState, getGlobalState } from '../store'
import { getCurrentUser } from './supabase'

// Function to sync blockchain project data with Supabase
export const syncProjectWithSupabase = async (project) => {
  try {
    // Get current user if available
    const { data: userData } = await getCurrentUser()
    const user = userData?.user

    // Check if project already exists in Supabase by chain_id
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('chain_id', project.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching project:', fetchError.message)
      return { success: false, message: fetchError.message }
    }

    const projectData = {
      chain_id: project.id, // Store blockchain ID as chain_id instead of using it as a foreign key
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
      milestones_completed: project.milestonesCompleted,
      user_id: user?.id // Link to the current user if available
    }

    let result
    if (existingProject) {
      // Update existing project
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', existingProject.id) // Use database ID instead of blockchain_id
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
export const syncMilestoneWithSupabase = async (chainId, milestone) => {
  try {
    // First, get the project by chain_id to get its database ID
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('chain_id', chainId)
      .single()

    if (projectError) {
      console.error('Error fetching project for milestone:', projectError.message)
      return { success: false, message: 'Project not found' }
    }

    const projectId = projectData.id

    // Check if milestone already exists in Supabase
    const { data: existingMilestone, error: fetchError } = await supabase
      .from('milestones')
      .select('*')
      .eq('blockchain_id', milestone.id)
      .eq('project_id', projectId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching milestone:', fetchError.message)
      return { success: false, message: fetchError.message }
    }

    const milestoneData = {
      blockchain_id: milestone.id,
      project_id: projectId, // Use database project ID instead of blockchain_id
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
        .eq('id', existingMilestone.id) // Use database ID
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
export const syncBackerWithSupabase = async (chainId, backer) => {
  try {
    // First, get the project by chain_id to get its database ID
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('chain_id', chainId)
      .single()

    if (projectError) {
      console.error('Error fetching project for backer:', projectError.message)
      return { success: false, message: 'Project not found' }
    }

    const projectId = projectData.id

    // Check if backer already exists in Supabase
    const { data: existingBacker, error: fetchError } = await supabase
      .from('backers')
      .select('*')
      .eq('owner', backer.owner.toLowerCase())
      .eq('project_id', projectId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching backer:', fetchError.message)
      return { success: false, message: fetchError.message }
    }

    const backerData = {
      owner: backer.owner.toLowerCase(),
      project_id: projectId, // Use database project ID instead of blockchain_id
      contribution: backer.contribution,
      timestamp: backer.timestamp,
      refunded: backer.refunded
    }

    let result
    if (existingBacker) {
      // Update existing backer
      const { data, error } = await supabase
        .from('backers')
        .update(backerData)
        .eq('id', existingBacker.id) // Use database ID
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
export const getProjectsFromSupabase = async (filters = {}) => {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        creator:user_id(*),
        approver:admin_approved_by(id, email, first_name, last_name),
        featured_by_admin:featured_by(id, email, first_name, last_name)
      `)

    // Apply filters if provided
    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.adminApproved !== undefined) {
      query = query.eq('admin_approved', filters.adminApproved)
    }
    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }
    if (filters.hasMilestones !== undefined) {
      query = query.eq('has_milestones', filters.hasMilestones)
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Order by created_at by default, but allow custom ordering
    const orderField = filters.orderBy || 'created_at'
    const orderDirection = filters.ascending ? { ascending: true } : { ascending: false }
    query = query.order(orderField, orderDirection)

    // Apply pagination if provided
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

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
export const getProjectFromSupabase = async (id, useChainId = false) => {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        creator:user_id(*),
        approver:admin_approved_by(id, email, first_name, last_name),
        featured_by_admin:featured_by(id, email, first_name, last_name),
        milestones:milestones(*),
        backers:backers(*)
      `)

    // Use either database ID or chain_id based on the flag
    if (useChainId) {
      query = query.eq('chain_id', id)
    } else {
      query = query.eq('id', id)
    }

    const { data, error } = await query.single()

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
export const getMilestonesFromSupabase = async (projectId, useChainId = false) => {
  try {
    let query;
    
    if (useChainId) {
      // First get the project's database ID using chain_id
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('chain_id', projectId)
        .single()

      if (projectError) {
        console.error('Error fetching project for milestones:', projectError.message)
        return { success: false, message: 'Project not found' }
      }
      
      query = supabase
        .from('milestones')
        .select(`
          *,
          reviewer:admin_reviewed_by(id, email, first_name, last_name)
        `)
        .eq('project_id', project.id)
    } else {
      // Use the provided project ID directly (database ID)
      query = supabase
        .from('milestones')
        .select(`
          *,
          reviewer:admin_reviewed_by(id, email, first_name, last_name)
        `)
        .eq('project_id', projectId)
    }
    
    // Order by created_at
    query = query.order('created_at', { ascending: true })

    const { data, error } = await query

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
export const getBackersFromSupabase = async (projectId, useChainId = false) => {
  try {
    let query;
    
    if (useChainId) {
      // First get the project's database ID using chain_id
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('chain_id', projectId)
        .single()

      if (projectError) {
        console.error('Error fetching project for backers:', projectError.message)
        return { success: false, message: 'Project not found' }
      }
      
      query = supabase
        .from('backers')
        .select(`
          *,
          flagger:flagged_by(id, email, first_name, last_name)
        `)
        .eq('project_id', project.id)
    } else {
      // Use the provided project ID directly (database ID)
      query = supabase
        .from('backers')
        .select(`
          *,
          flagger:flagged_by(id, email, first_name, last_name)
        `)
        .eq('project_id', projectId)
    }
    
    // Order by timestamp
    query = query.order('timestamp', { ascending: false })

    const { data, error } = await query

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
