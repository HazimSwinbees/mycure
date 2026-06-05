import { supabase } from '../lib/supabaseClient'

const notificationsTable = 'notifications'

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  const userId = data?.user?.id

  if (!userId) {
    throw new Error('You must be signed in to manage notifications.')
  }

  return userId
}

const formatNotificationTime = (createdAt) => {
  if (!createdAt) {
    return 'Recently'
  }

  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return created.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const mapNotificationRecord = (record) => ({
  id: String(record.id),
  title: record.title,
  body: record.body,
  type: record.type,
  recipientType: record.recipient_type || 'patient',
  time: formatNotificationTime(record.created_at),
  read: record.read,
  createdAt: record.created_at,
  appointmentId: record.appointment_id ? String(record.appointment_id) : '',
  medicalRecordId: record.medical_record_id ? String(record.medical_record_id) : '',
})

export const getCurrentPatientNotifications = async () => {
  const patientId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(notificationsTable)
    .select('*')
    .eq('patient_id', patientId)
    .eq('recipient_type', 'patient')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(mapNotificationRecord)
}

export const getDoctorNotifications = async () => {
  const { data, error } = await supabase
    .from(notificationsTable)
    .select('*')
    .eq('recipient_type', 'doctor')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(mapNotificationRecord)
}

export const markNotificationRead = async (notificationId) => {
  const patientId = await getCurrentUserId()

  const { error } = await supabase
    .from(notificationsTable)
    .update({ read: true })
    .eq('id', notificationId)
    .eq('patient_id', patientId)
    .eq('recipient_type', 'patient')

  if (error) {
    throw new Error(error.message)
  }
}

export const markDoctorNotificationRead = async (notificationId) => {
  const { error } = await supabase
    .from(notificationsTable)
    .update({ read: true })
    .eq('id', notificationId)
    .eq('recipient_type', 'doctor')

  if (error) {
    throw new Error(error.message)
  }
}

export const markAllNotificationsRead = async () => {
  const patientId = await getCurrentUserId()

  const { error } = await supabase
    .from(notificationsTable)
    .update({ read: true })
    .eq('patient_id', patientId)
    .eq('recipient_type', 'patient')
    .eq('read', false)

  if (error) {
    throw new Error(error.message)
  }
}

export const markAllDoctorNotificationsRead = async () => {
  const { error } = await supabase
    .from(notificationsTable)
    .update({ read: true })
    .eq('recipient_type', 'doctor')
    .eq('read', false)

  if (error) {
    throw new Error(error.message)
  }
}

export const createPatientNotification = async ({
  patientId,
  title,
  body,
  type = 'General',
  appointmentId = null,
  medicalRecordId = null,
}) => {
  const { error } = await supabase.from(notificationsTable).insert({
    patient_id: patientId,
    title,
    body,
    type,
    recipient_type: 'patient',
    appointment_id: appointmentId,
    medical_record_id: medicalRecordId,
    read: false,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export const createDoctorNotification = async ({
  patientId = null,
  title,
  body,
  type = 'General',
  appointmentId = null,
  medicalRecordId = null,
}) => {
  const { error } = await supabase.from(notificationsTable).insert({
    patient_id: patientId,
    title,
    body,
    type,
    recipient_type: 'doctor',
    appointment_id: appointmentId,
    medical_record_id: medicalRecordId,
    read: false,
  })

  if (error) {
    throw new Error(error.message)
  }
}
