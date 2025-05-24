import { supabase } from './supabase'
import { getCurrentUser } from './supabase'
import { getCurrentAdmin } from './admin'

// Helper function to generate a unique ticket number
const generateTicketNumber = () => {
  const prefix = 'TICK-'
  const randomPart = Math.floor(1000 + Math.random() * 9000) // 4-digit number
  const timestamp = Date.now().toString().slice(-4) // Last 4 digits of timestamp
  return `${prefix}${randomPart}${timestamp}`
}

// Support Tickets
export const createSupportTicket = async (ticketData) => {
  try {
    // Get current user if available
    const { data: userData } = await getCurrentUser()
    const user = userData?.user

    // Create the ticket with a generated ticket number
    const ticket = {
      ticket_number: generateTicketNumber(),
      user_name: ticketData.name,
      user_email: ticketData.email || user?.email,
      category: ticketData.category,
      subject: ticketData.subject,
      description: ticketData.description,
      project_id: ticketData.projectId || null,
      status: 'open',
      priority: ticketData.priority || 'medium'
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticket])
      .select()

    if (error) {
      console.error('Error creating support ticket:', error.message)
      return { success: false, message: error.message }
    }

    // If there's an initial message, add it
    if (ticketData.message) {
      await addTicketMessage(data[0].id, ticketData.message, user?.id)
    }

    // If there are attachments, upload them
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      for (const file of ticketData.attachments) {
        await uploadTicketAttachment(data[0].id, null, file)
      }
    }

    return { success: true, ticket: data[0] }
  } catch (error) {
    console.error('Exception creating support ticket:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const getSupportTickets = async (filters = {}) => {
  try {
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        messages:ticket_messages(*)
      `)
      .order('created_at', { ascending: false })

    // Apply filters if provided
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.userEmail) {
      query = query.eq('user_email', filters.userEmail)
    }
    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId)
    }
    if (filters.adminAssignee) {
      query = query.eq('admin_assignee', filters.adminAssignee)
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
      console.error('Error fetching support tickets:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, tickets: data }
  } catch (error) {
    console.error('Exception fetching support tickets:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const getSupportTicket = async (ticketId) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        messages:ticket_messages(
          *,
          attachments:ticket_attachments(*)
        ),
        attachments:ticket_attachments(*)
      `)
      .eq('id', ticketId)
      .single()

    if (error) {
      console.error('Error fetching support ticket:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, ticket: data }
  } catch (error) {
    console.error('Exception fetching support ticket:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const updateSupportTicket = async (ticketId, ticketData) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        ...ticketData,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()

    if (error) {
      console.error('Error updating support ticket:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, ticket: data[0] }
  } catch (error) {
    console.error('Exception updating support ticket:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const assignTicket = async (ticketId, adminId) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        admin_assignee: adminId,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()

    if (error) {
      console.error('Error assigning support ticket:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, ticket: data[0] }
  } catch (error) {
    console.error('Exception assigning support ticket:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const resolveTicket = async (ticketId) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()

    if (error) {
      console.error('Error resolving support ticket:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, ticket: data[0] }
  } catch (error) {
    console.error('Exception resolving support ticket:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Ticket Messages
export const addTicketMessage = async (ticketId, message, userId = null) => {
  try {
    // Determine if this is a user or admin message
    let messageData = {
      ticket_id: ticketId,
      message
    }

    if (userId) {
      // User message
      messageData.user_id = userId
      messageData.admin_id = null
    } else {
      // Admin message - get current admin
      const { success, admin } = getCurrentAdmin()
      if (!success) {
        return { success: false, message: 'No admin session found' }
      }
      messageData.admin_id = admin.id
      messageData.user_id = null
    }

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([messageData])
      .select()

    if (error) {
      console.error('Error adding ticket message:', error.message)
      return { success: false, message: error.message }
    }

    // Update the ticket's updated_at timestamp
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    return { success: true, message: data[0] }
  } catch (error) {
    console.error('Exception adding ticket message:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const getTicketMessages = async (ticketId) => {
  try {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select(`
        *,
        attachments:ticket_attachments(*)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching ticket messages:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true, messages: data }
  } catch (error) {
    console.error('Exception fetching ticket messages:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Ticket Attachments
export const uploadTicketAttachment = async (ticketId, messageId = null, file) => {
  try {
    // Upload the file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `tickets/${ticketId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('support-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading attachment:', uploadError.message)
      return { success: false, message: uploadError.message }
    }

    // Get the file's public URL
    const { data: urlData } = supabase.storage
      .from('support-attachments')
      .getPublicUrl(filePath)

    // Create a record in the ticket_attachments table
    const attachmentData = {
      ticket_id: ticketId,
      message_id: messageId,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size
    }

    const { data, error } = await supabase
      .from('ticket_attachments')
      .insert([attachmentData])
      .select()

    if (error) {
      console.error('Error creating attachment record:', error.message)
      return { success: false, message: error.message }
    }

    return { 
      success: true, 
      attachment: {
        ...data[0],
        url: urlData.publicUrl
      }
    }
  } catch (error) {
    console.error('Exception uploading attachment:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const getTicketAttachments = async (ticketId) => {
  try {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching ticket attachments:', error.message)
      return { success: false, message: error.message }
    }

    // Add public URLs for each attachment
    const attachmentsWithUrls = data.map(attachment => {
      const { data: urlData } = supabase.storage
        .from('support-attachments')
        .getPublicUrl(attachment.file_path)

      return {
        ...attachment,
        url: urlData.publicUrl
      }
    })

    return { success: true, attachments: attachmentsWithUrls }
  } catch (error) {
    console.error('Exception fetching ticket attachments:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export const deleteTicketAttachment = async (attachmentId) => {
  try {
    // First get the attachment to get the file path
    const { data: attachment, error: fetchError } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single()

    if (fetchError) {
      console.error('Error fetching attachment:', fetchError.message)
      return { success: false, message: fetchError.message }
    }

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('support-attachments')
      .remove([attachment.file_path])

    if (storageError) {
      console.error('Error deleting attachment file:', storageError.message)
      return { success: false, message: storageError.message }
    }

    // Delete the record from the database
    const { error } = await supabase
      .from('ticket_attachments')
      .delete()
      .eq('id', attachmentId)

    if (error) {
      console.error('Error deleting attachment record:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Exception deleting attachment:', error.message)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
