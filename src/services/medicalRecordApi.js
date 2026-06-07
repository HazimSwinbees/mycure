import { supabase } from '../lib/supabaseClient'
import { getDoctorAppointmentById } from './appointmentApi'
import { createPatientNotification } from './notificationApi'
import { getPatientProfilesByIds } from './patientApi'

const medicalRecordsTable = 'medical_records'
const prescriptionsTable = 'prescriptions'
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
    return '-'
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

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  const userId = data?.user?.id
  if (!userId) {
    throw new Error('You must be signed in to manage medical records.')
  }

  return userId
}

const getCurrentDoctorId = getCurrentUserId

const mapPrescriptionRecord = (record) => ({
  id: String(record.id),
  medicineName: record.medicine_name || '-',
  strength: record.strength || '-',
  dosage: record.dosage || '-',
  frequency: record.frequency || '-',
  duration: record.duration || '-',
  instructions: record.instructions || '-',
  status: record.status || 'Active',
  issuedDate: formatDisplayDate(record.issued_date),
})

const mapMedicalRecord = (record, patientProfile, prescriptionCount = 0) => ({
  id: String(record.id),
  appointmentId: record.appointment_id ? String(record.appointment_id) : '',
  patientId: record.patient_id,
  patientName:
    patientProfile?.full_name ||
    `${patientProfile?.first_name || ''} ${patientProfile?.last_name || ''}`.trim() ||
    'Patient',
  patientEmail: patientProfile?.email || '-',
  serviceName: record.service_name || '-',
  appointmentTime: record.appointment_time || '-',
  visitDate: formatDisplayDate(record.visit_date),
  rawVisitDate: record.visit_date || '',
  chiefComplaint: record.chief_complaint || '-',
  clinicalNote: record.clinical_note || '-',
  diagnosis: record.diagnosis || '-',
  followUp: record.follow_up || '-',
  prescriptionCount,
  createdAt: record.created_at || '',
})

export const getMedicalRecordDraftByAppointmentId = async (appointmentId) => {
  const appointment = await getDoctorAppointmentById(appointmentId)

  if (!appointment) {
    return null
  }

  return {
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patientName || 'Patient',
    visitDate: appointment.rawDate || '',
    appointmentTime: appointment.time || '',
    serviceName: appointment.service || '',
    chiefComplaint: appointment.notes || '',
  }
}

export const createMedicalRecord = async ({
  appointmentId,
  patientId,
  visitDate,
  appointmentTime,
  serviceName,
  chiefComplaint,
  clinicalNote,
  diagnosis,
  followUp,
  prescription,
}) => {
  const doctorId = await getCurrentDoctorId()

  const payload = {
    appointment_id: appointmentId || null,
    patient_id: patientId,
    doctor_id: doctorId,
    visit_date: visitDate,
    appointment_time: appointmentTime,
    service_name: serviceName,
    chief_complaint: chiefComplaint,
    clinical_note: clinicalNote,
    diagnosis,
    follow_up: followUp,
  }

  const { data: record, error: recordError } = await supabase
    .from(medicalRecordsTable)
    .insert(payload)
    .select('*')
    .single()

  if (recordError) {
    throw new Error(recordError.message)
  }

  if (prescription?.enabled) {
    const prescriptionPayload = {
      medical_record_id: record.id,
      patient_id: patientId,
      doctor_id: doctorId,
      medicine_name: prescription.medicineName,
      strength: prescription.strength,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      status: 'Active',
      issued_date: visitDate || new Date().toISOString().slice(0, 10),
    }

    const { error: prescriptionError } = await supabase
      .from(prescriptionsTable)
      .insert(prescriptionPayload)

    if (prescriptionError) {
      throw new Error(prescriptionError.message)
    }
  }

  if (appointmentId) {
    const { error: appointmentError } = await supabase
      .from(appointmentsTable)
      .update({
        status: 'Completed',
        status_reason: '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)

    if (appointmentError) {
      throw new Error(appointmentError.message)
    }
  }

  await notifySafely(() =>
    createPatientNotification({
      patientId,
      title: prescription?.enabled ? 'Prescription added' : 'Visit record available',
      body: prescription?.enabled
        ? `A prescription or treatment plan has been added to your ${serviceName} visit record on ${formatDisplayDate(visitDate)}.`
        : `Your medical visit record for ${serviceName} on ${formatDisplayDate(visitDate)} is now available.`,
      type: prescription?.enabled ? 'Prescriptions' : 'Medical Records',
      appointmentId,
      medicalRecordId: record.id,
    }),
  )

  return String(record.id)
}

export const getCurrentPatientMedicalRecords = async () => {
  const patientId = await getCurrentUserId()

  const { data: records, error } = await supabase
    .from(medicalRecordsTable)
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const recordIds = (records || []).map((item) => item.id)
  const prescriptionMap = new Map()

  if (recordIds.length) {
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from(prescriptionsTable)
      .select('*')
      .in('medical_record_id', recordIds)
      .order('created_at', { ascending: false })

    if (prescriptionsError) {
      throw new Error(prescriptionsError.message)
    }

    for (const item of prescriptions || []) {
      const current = prescriptionMap.get(item.medical_record_id) || []
      current.push(mapPrescriptionRecord(item))
      prescriptionMap.set(item.medical_record_id, current)
    }
  }

  return (records || []).map((record) => ({
    id: String(record.id),
    appointmentId: record.appointment_id ? String(record.appointment_id) : '',
    serviceName: record.service_name || '-',
    appointmentTime: record.appointment_time || '-',
    visitDate: formatDisplayDate(record.visit_date),
    rawVisitDate: record.visit_date || '',
    chiefComplaint: record.chief_complaint || '-',
    clinicalNote: record.clinical_note || '-',
    diagnosis: record.diagnosis || '-',
    followUp: record.follow_up || '-',
    prescriptions: prescriptionMap.get(record.id) || [],
  }))
}

export const getCurrentPatientMedicalRecordById = async (id) => {
  const patientId = await getCurrentUserId()

  const { data: record, error } = await supabase
    .from(medicalRecordsTable)
    .select('*')
    .eq('id', id)
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!record) {
    return null
  }

  const { data: prescriptions, error: prescriptionsError } = await supabase
    .from(prescriptionsTable)
    .select('*')
    .eq('medical_record_id', record.id)
    .order('created_at', { ascending: false })

  if (prescriptionsError) {
    throw new Error(prescriptionsError.message)
  }

  const appointmentStatus = record.appointment_id
    ? (
        await supabase
          .from(appointmentsTable)
          .select('status')
          .eq('id', record.appointment_id)
          .eq('patient_id', patientId)
          .maybeSingle()
      ).data?.status || '-'
    : '-'

  return {
    id: String(record.id),
    appointmentId: record.appointment_id ? String(record.appointment_id) : '',
    serviceName: record.service_name || '-',
    appointmentTime: record.appointment_time || '-',
    visitDate: formatDisplayDate(record.visit_date),
    rawVisitDate: record.visit_date || '',
    chiefComplaint: record.chief_complaint || '-',
    clinicalNote: record.clinical_note || '-',
    diagnosis: record.diagnosis || '-',
    followUp: record.follow_up || '-',
    appointmentStatus,
    prescriptions: (prescriptions || []).map(mapPrescriptionRecord),
  }
}

export const getCurrentPatientMedicalRecordByAppointmentId = async (appointmentId) => {
  if (!appointmentId) {
    return null
  }

  const patientId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(medicalRecordsTable)
    .select('id')
    .eq('appointment_id', appointmentId)
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? String(data.id) : null
}

export const getDoctorMedicalRecords = async () => {
  const { data: records, error } = await supabase
    .from(medicalRecordsTable)
    .select('*')
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const patientProfiles = await getPatientProfilesByIds((records || []).map((item) => item.patient_id))
  const patientMap = new Map(patientProfiles.map((profile) => [profile.id, profile]))

  const recordIds = (records || []).map((item) => item.id)
  const prescriptionCountMap = new Map()

  if (recordIds.length) {
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from(prescriptionsTable)
      .select('medical_record_id')
      .in('medical_record_id', recordIds)

    if (prescriptionsError) {
      throw new Error(prescriptionsError.message)
    }

    for (const item of prescriptions || []) {
      const current = prescriptionCountMap.get(item.medical_record_id) || 0
      prescriptionCountMap.set(item.medical_record_id, current + 1)
    }
  }

  return (records || []).map((record) =>
    mapMedicalRecord(record, patientMap.get(record.patient_id), prescriptionCountMap.get(record.id) || 0),
  )
}

export const getDoctorMedicalRecordById = async (id) => {
  const { data: record, error } = await supabase
    .from(medicalRecordsTable)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!record) {
    return null
  }

  const [patientProfile] = await getPatientProfilesByIds([record.patient_id])
  const appointment = record.appointment_id ? await getDoctorAppointmentById(record.appointment_id) : null

  const { data: prescriptions, error: prescriptionsError } = await supabase
    .from(prescriptionsTable)
    .select('*')
    .eq('medical_record_id', record.id)
    .order('created_at', { ascending: false })

  if (prescriptionsError) {
    throw new Error(prescriptionsError.message)
  }

  return {
    ...mapMedicalRecord(record, patientProfile, (prescriptions || []).length),
    patientAge: appointment?.patientAge ?? null,
    patientGender: appointment?.patientGender || patientProfile?.gender || '-',
    patientPhone: appointment?.patientPhone || patientProfile?.phone || '-',
    patientEmail: appointment?.patientEmail || patientProfile?.email || '-',
    appointmentStatus: appointment?.status || '-',
    prescriptions: (prescriptions || []).map(mapPrescriptionRecord),
  }
}

export const getDoctorMedicalRecordByAppointmentId = async (appointmentId) => {
  if (!appointmentId) {
    return null
  }

  const { data, error } = await supabase
    .from(medicalRecordsTable)
    .select('id')
    .eq('appointment_id', appointmentId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? String(data.id) : null
}
