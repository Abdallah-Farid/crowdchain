import { supabase } from './supabase'
import { getCurrentAdmin } from './admin'

// Platform Settings
export const getPlatformSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select(`
        *,
        updated_by_admin:admins(id, email, first_name, last_name)
      `)
      .order('setting_key', { ascending: true })

    if (error) {
      console.error('Error fetching platform settings:', error.message)
      return { success: false, message: error.message }
    }

    // Convert settings to a more usable format (key-value object)
    const settingsObject = data.reduce((acc, setting) => {
      acc[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        updatedBy: setting.updated_by_admin,
        updatedAt: setting.updated_at
      }
      return acc
    }, {})

    return { success: true, settings: settingsObject, rawSettings: data }
  } catch (error) {
    console.error('Exception fetching platform settings:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const getSetting = async (key) => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select(`
        *,
        updated_by_admin:admins(id, email, first_name, last_name)
      `)
      .eq('setting_key', key)
      .single()

    if (error) {
      console.error(`Error fetching setting ${key}:`, error.message)
      return { success: false, message: error.message }
    }

    return { 
      success: true, 
      setting: {
        key: data.setting_key,
        value: data.setting_value,
        description: data.description,
        updatedBy: data.updated_by_admin,
        updatedAt: data.updated_at
      }
    }
  } catch (error) {
    console.error(`Exception fetching setting ${key}:`, error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const updateSetting = async (key, value, description = null) => {
  try {
    // Get current admin
    const { success: adminSuccess, admin } = getCurrentAdmin()
    if (!adminSuccess) {
      return { success: false, message: 'Admin authentication required' }
    }

    // Check if setting exists
    const { data: existingSetting, error: fetchError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('setting_key', key)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`Error checking if setting ${key} exists:`, fetchError.message)
      return { success: false, message: fetchError.message }
    }

    let result
    if (existingSetting) {
      // Update existing setting
      const { data, error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: value,
          description: description || existingSetting.description,
          updated_by: admin.id,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key)
        .select()

      if (error) {
        console.error(`Error updating setting ${key}:`, error.message)
        return { success: false, message: error.message }
      }
      result = { success: true, setting: data[0] }
    } else {
      // Create new setting
      const { data, error } = await supabase
        .from('platform_settings')
        .insert([{
          setting_key: key,
          setting_value: value,
          description,
          updated_by: admin.id
        }])
        .select()

      if (error) {
        console.error(`Error creating setting ${key}:`, error.message)
        return { success: false, message: error.message }
      }
      result = { success: true, setting: data[0] }
    }

    return result
  } catch (error) {
    console.error(`Exception updating setting ${key}:`, error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const deleteSetting = async (key) => {
  try {
    // Get current admin
    const { success: adminSuccess } = getCurrentAdmin()
    if (!adminSuccess) {
      return { success: false, message: 'Admin authentication required' }
    }

    const { error } = await supabase
      .from('platform_settings')
      .delete()
      .eq('setting_key', key)

    if (error) {
      console.error(`Error deleting setting ${key}:`, error.message)
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error(`Exception deleting setting ${key}:`, error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Analytics
export const getAnalyticsAggregates = async (filters = {}) => {
  try {
    let query = supabase
      .from('analytics_aggregates')
      .select('*')

    // Apply filters if provided
    if (filters.metricName) {
      query = query.eq('metric_name', filters.metricName)
    }
    if (filters.timePeriod) {
      query = query.eq('time_period', filters.timePeriod)
    }
    if (filters.fromDate) {
      query = query.gte('start_date', filters.fromDate)
    }
    if (filters.toDate) {
      query = query.lte('end_date', filters.toDate)
    }

    // Order by date and then by metric name
    query = query.order('start_date', { ascending: false })
      .order('metric_name', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching analytics aggregates:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, analytics: data }
  } catch (error) {
    console.error('Exception fetching analytics aggregates:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const createAnalyticsAggregate = async (metricName, timePeriod, startDate, endDate, value) => {
  try {
    // Get current admin
    const { success: adminSuccess } = getCurrentAdmin()
    if (!adminSuccess) {
      return { success: false, message: 'Admin authentication required' }
    }

    const { data, error } = await supabase
      .from('analytics_aggregates')
      .insert([{
        metric_name: metricName,
        time_period: timePeriod,
        start_date: startDate,
        end_date: endDate,
        value
      }])
      .select()

    if (error) {
      console.error('Error creating analytics aggregate:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, analytic: data[0] }
  } catch (error) {
    console.error('Exception creating analytics aggregate:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const updateAnalyticsAggregate = async (id, value) => {
  try {
    // Get current admin
    const { success: adminSuccess } = getCurrentAdmin()
    if (!adminSuccess) {
      return { success: false, message: 'Admin authentication required' }
    }

    const { data, error } = await supabase
      .from('analytics_aggregates')
      .update({ value })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating analytics aggregate:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, analytic: data[0] }
  } catch (error) {
    console.error('Exception updating analytics aggregate:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const deleteAnalyticsAggregate = async (id) => {
  try {
    // Get current admin
    const { success: adminSuccess } = getCurrentAdmin()
    if (!adminSuccess) {
      return { success: false, message: 'Admin authentication required' }
    }

    const { error } = await supabase
      .from('analytics_aggregates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting analytics aggregate:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Exception deleting analytics aggregate:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Dashboard Analytics
export const getDashboardStats = async () => {
  try {
    // Get current date
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Get date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

    // Get projects count
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, created_at, admin_approved')
      .gte('created_at', thirtyDaysAgoStr)

    if (projectsError) {
      console.error('Error fetching projects for stats:', projectsError.message)
      return { success: false, message: projectsError.message }
    }

    // Get backers count
    const { data: backersData, error: backersError } = await supabase
      .from('backers')
      .select('id, created_at, contribution')
      .gte('created_at', thirtyDaysAgoStr)

    if (backersError) {
      console.error('Error fetching backers for stats:', backersError.message)
      return { success: false, message: backersError.message }
    }

    // Get support tickets count
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('id, created_at, status')
      .gte('created_at', thirtyDaysAgoStr)

    if (ticketsError) {
      console.error('Error fetching tickets for stats:', ticketsError.message)
      return { success: false, message: ticketsError.message }
    }

    // Calculate stats
    const totalProjects = projectsData.length
    const approvedProjects = projectsData.filter(p => p.admin_approved).length
    const pendingProjects = totalProjects - approvedProjects
    
    const totalBackers = backersData.length
    const totalFunding = backersData.reduce((sum, b) => sum + (b.contribution || 0), 0)
    
    const totalTickets = ticketsData.length
    const openTickets = ticketsData.filter(t => t.status === 'open').length
    const resolvedTickets = ticketsData.filter(t => t.status === 'resolved').length

    // Get daily stats for the last 30 days
    const dailyStats = {}
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      dailyStats[dateStr] = {
        projects: 0,
        backers: 0,
        funding: 0,
        tickets: 0
      }
    }

    // Fill in daily stats
    projectsData.forEach(project => {
      const dateStr = new Date(project.created_at).toISOString().split('T')[0]
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].projects++
      }
    })

    backersData.forEach(backer => {
      const dateStr = new Date(backer.created_at).toISOString().split('T')[0]
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].backers++
        dailyStats[dateStr].funding += (backer.contribution || 0)
      }
    })

    ticketsData.forEach(ticket => {
      const dateStr = new Date(ticket.created_at).toISOString().split('T')[0]
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].tickets++
      }
    })

    return {
      success: true,
      stats: {
        summary: {
          totalProjects,
          approvedProjects,
          pendingProjects,
          totalBackers,
          totalFunding,
          totalTickets,
          openTickets,
          resolvedTickets
        },
        daily: Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats
        })).sort((a, b) => a.date.localeCompare(b.date))
      }
    }
  } catch (error) {
    console.error('Exception getting dashboard stats:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
