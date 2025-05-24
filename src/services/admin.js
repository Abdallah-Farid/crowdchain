import { supabase } from './supabase'

// Admin Authentication
export const adminSignIn = async (email, password) => {
  try {
    // First, check if the email exists in the admins table
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email, password_hash, first_name, last_name, role, permissions')
      .eq('email', email)
      .single()

    if (adminError) {
      console.error('Error fetching admin:', adminError.message)
      return { success: false, message: 'Invalid credentials' }
    }

    // For security, password verification should be done server-side
    // This would typically be handled by a Supabase Edge Function or backend API
    // Here we're showing the client-side code that would call such a function
    
    // Example of calling a server function to verify password (replace with actual implementation)
    const { data: verificationResult, error: verificationError } = await supabase.functions
      .invoke('verify-admin-password', {
        body: { email, password }
      })

    if (verificationError || !verificationResult?.success) {
      return { success: false, message: 'Invalid credentials' }
    }

    // If verification succeeded, return admin data (without password hash)
    const { password_hash, ...adminData } = admin
    
    // Store admin session info in localStorage or state management
    localStorage.setItem('adminSession', JSON.stringify({
      id: adminData.id,
      email: adminData.email,
      role: adminData.role,
      permissions: adminData.permissions
    }))

    return { success: true, admin: adminData }
  } catch (error) {
    console.error('Exception in admin sign in:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const adminSignOut = () => {
  localStorage.removeItem('adminSession')
  return { success: true }
}

export const getCurrentAdmin = () => {
  const adminSession = localStorage.getItem('adminSession')
  if (!adminSession) {
    return { success: false, message: 'No admin session found' }
  }
  
  try {
    const admin = JSON.parse(adminSession)
    return { success: true, admin }
  } catch (error) {
    console.error('Error parsing admin session:', error.message)
    return { success: false, message: 'Invalid admin session' }
  }
}

// Admin Management
export const getAdmins = async () => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, first_name, last_name, role, permissions, last_login, created_at, updated_at, active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admins:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, admins: data }
  } catch (error) {
    console.error('Exception fetching admins:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const getAdmin = async (id) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, first_name, last_name, role, permissions, last_login, created_at, updated_at, active')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching admin:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, admin: data }
  } catch (error) {
    console.error('Exception fetching admin:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const createAdmin = async (adminData) => {
  try {
    // Password hashing should be done server-side
    // This would call a secure server function to create the admin with a hashed password
    const { data: result, error } = await supabase.functions
      .invoke('create-admin', {
        body: adminData
      })

    if (error) {
      console.error('Error creating admin:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, admin: result.admin }
  } catch (error) {
    console.error('Exception creating admin:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const updateAdmin = async (id, adminData) => {
  try {
    // If password is being updated, it should be handled separately via a secure function
    if (adminData.password) {
      const { data: passwordResult, error: passwordError } = await supabase.functions
        .invoke('update-admin-password', {
          body: { id, password: adminData.password }
        })

      if (passwordError) {
        console.error('Error updating admin password:', passwordError.message)
        return { success: false, message: passwordError.message }
      }

      // Remove password from data to be updated directly
      delete adminData.password
    }

    // Update other admin data
    const { data, error } = await supabase
      .from('admins')
      .update({
        ...adminData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, email, first_name, last_name, role, permissions, last_login, created_at, updated_at, active')

    if (error) {
      console.error('Error updating admin:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, admin: data[0] }
  } catch (error) {
    console.error('Exception updating admin:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const deleteAdmin = async (id) => {
  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting admin:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Exception deleting admin:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Admin Actions
export const logAdminAction = async (adminId, actionType, entityType, entityId, details) => {
  try {
    const { data, error } = await supabase
      .from('admin_actions')
      .insert([{
        admin_id: adminId,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details
      }])
      .select()

    if (error) {
      console.error('Error logging admin action:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, action: data[0] }
  } catch (error) {
    console.error('Exception logging admin action:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const getAdminActions = async (filters = {}) => {
  try {
    let query = supabase
      .from('admin_actions')
      .select(`
        *,
        admin:admins(id, email, first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    // Apply filters if provided
    if (filters.adminId) {
      query = query.eq('admin_id', filters.adminId)
    }
    if (filters.actionType) {
      query = query.eq('action_type', filters.actionType)
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType)
    }
    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId)
    }
    if (filters.fromDate) {
      query = query.gte('created_at', filters.fromDate)
    }
    if (filters.toDate) {
      query = query.lte('created_at', filters.toDate)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching admin actions:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, actions: data }
  } catch (error) {
    console.error('Exception fetching admin actions:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Project Administration
export const approveProject = async (projectId, adminId, notes = null) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        admin_approved: true,
        admin_approved_by: adminId,
        admin_approved_at: new Date().toISOString(),
        admin_notes: notes
      })
      .eq('id', projectId)
      .select()

    if (error) {
      console.error('Error approving project:', error.message)
      return { success: false, message: error.message }
    }

    // Log the admin action
    await logAdminAction(
      adminId,
      'APPROVE_PROJECT',
      'projects',
      projectId.toString(),
      { notes }
    )

    return { success: true, project: data[0] }
  } catch (error) {
    console.error('Exception approving project:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const featureProject = async (projectId, adminId, featured = true) => {
  try {
    const updateData = featured
      ? {
          featured: true,
          featured_by: adminId,
          featured_at: new Date().toISOString()
        }
      : {
          featured: false,
          featured_by: null,
          featured_at: null
        }

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()

    if (error) {
      console.error('Error featuring project:', error.message)
      return { success: false, message: error.message }
    }

    // Log the admin action
    await logAdminAction(
      adminId,
      featured ? 'FEATURE_PROJECT' : 'UNFEATURE_PROJECT',
      'projects',
      projectId.toString(),
      { featured }
    )

    return { success: true, project: data[0] }
  } catch (error) {
    console.error('Exception featuring project:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const flagBacker = async (backerId, adminId, reason) => {
  try {
    const { data, error } = await supabase
      .from('backers')
      .update({
        flagged: true,
        flagged_reason: reason,
        flagged_by: adminId,
        flagged_at: new Date().toISOString()
      })
      .eq('id', backerId)
      .select()

    if (error) {
      console.error('Error flagging backer:', error.message)
      return { success: false, message: error.message }
    }

    // Log the admin action
    await logAdminAction(
      adminId,
      'FLAG_BACKER',
      'backers',
      backerId.toString(),
      { reason }
    )

    return { success: true, backer: data[0] }
  } catch (error) {
    console.error('Exception flagging backer:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const reviewMilestone = async (milestoneId, adminId, approved = true, notes = null) => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .update({
        admin_reviewed: true,
        admin_reviewed_by: adminId,
        admin_reviewed_at: new Date().toISOString(),
        admin_notes: notes
      })
      .eq('id', milestoneId)
      .select()

    if (error) {
      console.error('Error reviewing milestone:', error.message)
      return { success: false, message: error.message }
    }

    // Log the admin action
    await logAdminAction(
      adminId,
      approved ? 'APPROVE_MILESTONE' : 'REJECT_MILESTONE',
      'milestones',
      milestoneId.toString(),
      { approved, notes }
    )

    return { success: true, milestone: data[0] }
  } catch (error) {
    console.error('Exception reviewing milestone:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
