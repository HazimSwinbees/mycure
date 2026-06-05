import { supabase } from '../lib/supabaseClient'
import { getPatientProfilesByIds } from './patientApi'
import { createDoctorNotification, createPatientNotification } from './notificationApi'

const appointmentsTable = 'appointments'

const notifySafely = async (callback) => {
  try {
    await callback()
  } catch (error) {
    console.error('Notification error:', error)
  }
}

const formatDisplayDate = (dateString) => {
  if (!dateString) {
    return 'Not scheduled'
  }

  const parsedDate = new Date(dateString)

  if (Number.isNaN(parsedDate.getTime())) {
    return dateString
  }

  return parsedDate.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const mapAppointmentRecord = (record) => ({
  id: String(record.id),
  patientId: record.patient_id,
  service: record.service_name,
  doctor: record.doctor_name || 'Care team',
  date: formatDisplayDate(record.appointment_date),
  rawDate: record.appointment_date,
  time: record.appointment_time,
  status: record.status,
  location: record.location || 'Main clinic',
  notes: record.reason || '',
  statusReason: record.status_reason || '',
  duration: record.duration || 'Not specified',
  category: record.service_category || 'General',
})

const formatAge = (dateOfBirth) => {
  if (!dateOfBirth) return null

  const birthDate = new Date(dateOfBirth)
  if (Number.isNaN(birthDate.getTime())) return null

  const now = new Date()
  let age = now.getFullYear() - birthDate.getFullYear()
  const monthOffset = now.getMonth() - birthDate.getMonth()

  if (monthOffset < 0 || (monthOffset === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age
}

const mergeAppointmentsWithProfiles = async (records) => {
  const appointments = (records || []).map(mapAppointmentRecord)
  const patientProfiles = await getPatientProfilesByIds(appointments.map((item) => item.patientId))
  const profileMap = new Map(patientProfiles.map((profile) => [profile.id, profile]))

  return appointments.map((appointment) => {
    const profile = profileMap.get(appointment.patientId)

    return {
      ...appointment,
      patientName:
        profile?.full_name ||
        `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
        'Patient',
      patientPhone: profile?.phone || '-',
      patientEmail: profile?.email || '-',
      patientGender: profile?.gender || '-',
      patientAge: formatAge(profile?.date_of_birth),
    }
  })
}

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  const userId = data?.user?.id

  if (!userId) {
    throw new Error('You must be signed in to manage appointments.')
  }

  return userId
}

export const createAppointment = async (draft) => {
  const patientId = await getCurrentUserId()

  const payload = {
    patient_id: patientId,
    service_id: draft.serviceId,
    service_name: draft.serviceName,
    service_category: draft.serviceCategory,
    doctor_name: draft.doctorName || 'Care team',
    appointment_date: draft.date,
    appointment_time: draft.time,
    duration: draft.serviceDuration,
    location: draft.serviceLocation,
    reason: draft.reason,
    status: 'Pending',
  }

  const { data, error } = await supabase
    .from(appointmentsTable)
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const [appointment] = await mergeAppointmentsWithProfiles([data])

  await notifySafely(() =>
    createPatientNotification({
      patientId,
      title: 'Appointment request sent',
      body: `Your appointment request for ${appointment.service} on ${appointment.date} at ${appointment.time} has been submitted.`,
      type: 'Appointments',
      appointmentId: appointment.id,
    }),
  )

  await notifySafely(() =>
    createDoctorNotification({
      patientId,
      title: 'New appointment request',
      body: `${appointment.patientName || 'A patient'} requested ${appointment.service} on ${appointment.date} at ${appointment.time}.`,
      type: 'Appointments',
      appointmentId: appointment.id,
    }),
  )

  return appointment
}

export const getCurrentPatientAppointments = async () => {
  const patientId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(appointmentsTable)
    .select('*')
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(mapAppointmentRecord)
}

export const getCurrentPatientAppointmentById = async (id) => {
  const patientId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(appointmentsTable)
    .select('*')
    .eq('patient_id', patientId)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapAppointmentRecord(data) : null
}

export const updateCurrentPatientAppointmentStatus = async (id, { status, statusReason = '' }) => {
  const patientId = await getCurrentUserId()

  const payload = {
    status,
    status_reason: statusReason,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(appointmentsTable)
    .update(payload)
    .eq('id', id)
    .eq('patient_id', patientId)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const appointment = data ? mapAppointmentRecord(data) : null

  if (appointment && status === 'Cancelled') {
    await notifySafely(() =>
      createPatientNotification({
        patientId,
        title: 'Appointment cancelled',
        body: `You cancelled your appointment for ${appointment.service} on ${appointment.date} at ${appointment.time}.`,
        type: 'Appointments',
        appointmentId: appointment.id,
      }),
    )

    await notifySafely(() =>
      createDoctorNotification({
        patientId,
        title: 'Appointment cancelled by patient',
        body: `A patient cancelled the ${appointment.service} appointment on ${appointment.date} at ${appointment.time}. Reason: ${statusReason || 'No reason provided'}.`,
        type: 'Appointments',
        appointmentId: appointment.id,
      }),
    )
  }

  return appointment
}

export const getDoctorAppointments = async () => {
  const { data, error } = await supabase
    .from(appointmentsTable)
    .select('*')
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return mergeAppointmentsWithProfiles(data)
}

export const getDoctorAppointmentById = async (id) => {
  const { data, error } = await supabase
    .from(appointmentsTable)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  const [appointment] = await mergeAppointmentsWithProfiles([data])
  return appointment || null
}

export const getBookedAppointmentTimesForDate = async (dateString) => {
  if (!dateString) {
    return []
  }

  const { data, error } = await supabase
    .from(appointmentsTable)
    .select('appointment_time, status')
    .eq('appointment_date', dateString)
    .not('status', 'in', '("Cancelled","Rejected")')

  if (error) {
    throw new Error(error.message)
  }

  return [...new Set((data || []).map((item) => item.appointment_time).filter(Boolean))]
}

export const getBookedAppointmentsForDate = async (dateString) => {
  if (!dateString) {
    return []
  }

  const { data, error } = await supabase
    .from(appointmentsTable)
    .select('appointment_time, duration, status')
    .eq('appointment_date', dateString)
    .not('status', 'in', '("Cancelled","Rejected")')

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((item) => ({
    time: item.appointment_time,
    duration: item.duration || 'Not specified',
    status: item.status,
  }))
}

export const updateDoctorAppointmentStatus = async (id, { status, statusReason = '' }) => {
  const payload = {
    status,
    status_reason: statusReason,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(appointmentsTable)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const [appointment] = await mergeAppointmentsWithProfiles([data])

  if (appointment && status === 'Confirmed') {
    await notifySafely(() =>
      createPatientNotification({
        patientId: appointment.patientId,
        title: 'Appointment confirmed',
        body: `Your appointment for ${appointment.service} on ${appointment.date} at ${appointment.time} has been confirmed.`,
        type: 'Appointments',
        appointmentId: appointment.id,
      }),
    )
  }

  if (appointment && status === 'Rejected') {
    await notifySafely(() =>
      createPatientNotification({
        patientId: appointment.patientId,
        title: 'Appointment rejected',
        body: `Your appointment for ${appointment.service} was rejected. Reason: ${statusReason || 'No reason provided'}.`,
        type: 'Appointments',
        appointmentId: appointment.id,
      }),
    )
  }

  if (appointment && status === 'Cancelled') {
    await notifySafely(() =>
      createPatientNotification({
        patientId: appointment.patientId,
        title: 'Appointment cancelled',
        body: `Your appointment for ${appointment.service} on ${appointment.date} at ${appointment.time} was cancelled by the clinic. Reason: ${statusReason || 'No reason provided'}.`,
        type: 'Appointments',
        appointmentId: appointment.id,
      }),
    )
  }

  return appointment || null
}
