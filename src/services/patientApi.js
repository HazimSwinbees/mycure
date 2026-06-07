import { supabase } from '../lib/supabaseClient'

const patientProfilesTable = 'patient_profiles'
const patientMedicalHistoryTable = 'patient_medical_history'
const patientEmergencyContactsTable = 'patient_emergency_contacts'
const appointmentsTable = 'appointments'
const patientPhotosBucket = 'patient-photos'

const sanitizeFileName = (name) => String(name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_')

const uploadPatientPhoto = async (userId, photo) => {
  if (!photo) {
    return { photoPath: '', photoUrl: '' }
  }

  const photoPath = `${userId}/${Date.now()}-${sanitizeFileName(photo.name)}`
  const { error: uploadError } = await supabase.storage
    .from(patientPhotosBucket)
    .upload(photoPath, photo, {
      contentType: photo.type,
      upsert: true,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from(patientPhotosBucket).getPublicUrl(photoPath)

  return {
    photoPath,
    photoUrl: data?.publicUrl || '',
  }
}

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

const buildFullName = (profile) =>
  profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Patient'

const mapDoctorPatientRecord = (profile, lastAppointment) => ({
  id: profile.id,
  name: buildFullName(profile),
  age: formatAge(profile.date_of_birth),
  gender: profile.gender || '-',
  phone: profile.phone || '-',
  email: profile.email || '-',
  photoUrl: profile.photo_url || '',
  lastVisit: formatDisplayDate(lastAppointment?.appointment_date),
  condition: lastAppointment?.reason || lastAppointment?.service_name || '-',
})

const formatFallbackProfile = (user) => {
  const metadata = user?.user_metadata || {}
  const firstName = metadata.first_name || ''
  const lastName = metadata.last_name || ''
  const fullName = metadata.name || `${firstName} ${lastName}`.trim() || 'Patient'

  return {
    id: user?.id || '',
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    ic_passport_number: metadata.ic_passport_number || '',
    date_of_birth: metadata.date_of_birth || '',
    gender: metadata.gender || '',
    phone: metadata.phone || '',
    email: user?.email || metadata.email || '',
    home_address: metadata.home_address || '',
    photo_url: metadata.photo_url || '',
    photo_path: metadata.photo_path || '',
    role: metadata.role || 'patient',
  }
}

const getCurrentUserOrStoredUser = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError && userError.message !== 'Auth session missing!') {
    throw new Error(userError.message)
  }

  const user = userData?.user

  if (user) {
    return user
  }

  const storedUser = localStorage.getItem('mycure_user')
  if (storedUser) {
    return JSON.parse(storedUser)
  }

  return null
}

const getCurrentAuthenticatedUserId = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  const userId = data?.user?.id

  if (!userId) {
    throw new Error('You must be signed in to update your profile.')
  }

  return userId
}

export const getCurrentPatientProfile = async () => {
  const user = await getCurrentUserOrStoredUser()

  if (!user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from(patientProfilesTable)
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return formatFallbackProfile(user)
  }

  return profile || formatFallbackProfile(user)
}

export const updateCurrentPatientProfile = async ({
  firstName,
  lastName,
  phone,
  homeAddress,
  dateOfBirth,
  photo,
}) => {
  const userId = await getCurrentAuthenticatedUserId()

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from(patientProfilesTable)
    .select('email, ic_passport_number, gender, photo_path, photo_url, role')
    .eq('id', userId)
    .maybeSingle()

  if (profileLookupError) {
    throw new Error(profileLookupError.message)
  }

  const { data: authUserData, error: authUserError } = await supabase.auth.getUser()

  if (authUserError) {
    throw new Error(authUserError.message)
  }

  const authUser = authUserData?.user
  const fallbackProfile = formatFallbackProfile(authUser)
  const { photoPath, photoUrl } = photo
    ? await uploadPatientPhoto(userId, photo)
    : {
        photoPath: existingProfile?.photo_path || fallbackProfile.photo_path || null,
        photoUrl: existingProfile?.photo_url || fallbackProfile.photo_url || null,
      }

  const payload = {
    id: userId,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    phone,
    home_address: homeAddress,
    date_of_birth: dateOfBirth || null,
    email: existingProfile?.email || fallbackProfile.email,
    ic_passport_number: existingProfile?.ic_passport_number || fallbackProfile.ic_passport_number,
    gender: existingProfile?.gender || fallbackProfile.gender,
    photo_path: photoPath,
    photo_url: photoUrl,
    role: existingProfile?.role || fallbackProfile.role || 'patient',
  }

  const { error } = await supabase.from(patientProfilesTable).upsert(payload, {
    onConflict: 'id',
  })

  if (error) {
    throw new Error(error.message)
  }

  return getCurrentPatientProfile()
}

export const updateDoctorPatientProfile = async (
  patientId,
  { firstName, lastName, phone, homeAddress, dateOfBirth },
) => {
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from(patientProfilesTable)
    .select('email, ic_passport_number, gender, photo_path, photo_url, role')
    .eq('id', patientId)
    .maybeSingle()

  if (profileLookupError) {
    throw new Error(profileLookupError.message)
  }

  const payload = {
    id: patientId,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    phone,
    home_address: homeAddress,
    date_of_birth: dateOfBirth || null,
    email: existingProfile?.email || '',
    ic_passport_number: existingProfile?.ic_passport_number || '',
    gender: existingProfile?.gender || '',
    photo_path: existingProfile?.photo_path || null,
    photo_url: existingProfile?.photo_url || null,
    role: existingProfile?.role || 'patient',
  }

  const { error } = await supabase.from(patientProfilesTable).upsert(payload, {
    onConflict: 'id',
  })

  if (error) {
    throw new Error(error.message)
  }

  return getDoctorPatientById(patientId)
}

export const getCurrentPatientMedicalHistory = async () => {
  const user = await getCurrentUserOrStoredUser()

  if (!user?.id) {
    return null
  }

  const { data, error } = await supabase
    .from(patientMedicalHistoryTable)
    .select('*')
    .eq('patient_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const upsertCurrentPatientMedicalHistory = async ({
  allergies,
  currentConditions,
  currentMedication,
  pastSurgery,
  familyHistory,
  bloodType,
}) => {
  const userId = await getCurrentAuthenticatedUserId()

  const { error } = await supabase.from(patientMedicalHistoryTable).upsert(
    {
      patient_id: userId,
      allergies,
      current_conditions: currentConditions,
      current_medication: currentMedication,
      past_surgery: pastSurgery,
      family_history: familyHistory,
      blood_type: bloodType,
    },
    {
      onConflict: 'patient_id',
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return getCurrentPatientMedicalHistory()
}

export const upsertDoctorPatientMedicalHistory = async (
  patientId,
  { allergies, currentConditions, currentMedication, pastSurgery, familyHistory, bloodType },
) => {
  const { error } = await supabase.from(patientMedicalHistoryTable).upsert(
    {
      patient_id: patientId,
      allergies,
      current_conditions: currentConditions,
      current_medication: currentMedication,
      past_surgery: pastSurgery,
      family_history: familyHistory,
      blood_type: bloodType,
    },
    {
      onConflict: 'patient_id',
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return getDoctorPatientById(patientId)
}

export const getCurrentPatientEmergencyContact = async () => {
  const user = await getCurrentUserOrStoredUser()

  if (!user?.id) {
    return null
  }

  const { data, error } = await supabase
    .from(patientEmergencyContactsTable)
    .select('*')
    .eq('patient_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const getPatientProfilesByIds = async (ids) => {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))]

  if (!uniqueIds.length) {
    return []
  }

  const { data, error } = await supabase
    .from(patientProfilesTable)
    .select('id, full_name, first_name, last_name, phone, email, gender, date_of_birth')
    .in('id', uniqueIds)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const getDoctorPatients = async () => {
  const { data: profiles, error: profilesError } = await supabase
    .from(patientProfilesTable)
    .select('id, full_name, first_name, last_name, phone, email, gender, date_of_birth, photo_url')
    .order('full_name', { ascending: true })

  if (profilesError) {
    throw new Error(profilesError.message)
  }

  const patientIds = (profiles || []).map((profile) => profile.id).filter(Boolean)
  const appointmentMap = new Map()

  if (patientIds.length) {
    const { data: appointments, error: appointmentsError } = await supabase
      .from(appointmentsTable)
      .select('patient_id, appointment_date, service_name, reason')
      .in('patient_id', patientIds)
      .order('appointment_date', { ascending: false })

    if (appointmentsError) {
      throw new Error(appointmentsError.message)
    }

    for (const appointment of appointments || []) {
      if (!appointmentMap.has(appointment.patient_id)) {
        appointmentMap.set(appointment.patient_id, appointment)
      }
    }
  }

  return (profiles || []).map((profile) => mapDoctorPatientRecord(profile, appointmentMap.get(profile.id)))
}

export const getDoctorPatientById = async (id) => {
  const { data: profile, error: profileError } = await supabase
    .from(patientProfilesTable)
    .select('id, full_name, first_name, last_name, phone, email, gender, date_of_birth, home_address, photo_url')
    .eq('id', id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!profile) {
    return null
  }

  const [{ data: medicalHistory, error: medicalError }, { data: emergencyContact, error: emergencyError }, { data: appointments, error: appointmentsError }] =
    await Promise.all([
      supabase.from(patientMedicalHistoryTable).select('*').eq('patient_id', id).maybeSingle(),
      supabase.from(patientEmergencyContactsTable).select('*').eq('patient_id', id).maybeSingle(),
      supabase
        .from(appointmentsTable)
        .select('id, service_name, reason, appointment_date, appointment_time, status')
        .eq('patient_id', id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false }),
    ])

  if (medicalError) {
    throw new Error(medicalError.message)
  }

  if (emergencyError) {
    throw new Error(emergencyError.message)
  }

  if (appointmentsError) {
    throw new Error(appointmentsError.message)
  }

  const recentAppointments = (appointments || []).map((appointment) => ({
    id: String(appointment.id),
    service: appointment.service_name || '-',
    reason: appointment.reason || '-',
    date: formatDisplayDate(appointment.appointment_date),
    time: appointment.appointment_time || '-',
    status: appointment.status || '-',
  }))

  const latestAppointment = appointments?.[0] || null

  return {
    id: profile.id,
    name: buildFullName(profile),
    firstName: profile.first_name || '-',
    lastName: profile.last_name || '-',
    age: formatAge(profile.date_of_birth),
    gender: profile.gender || '-',
    phone: profile.phone || '-',
    email: profile.email || '-',
    photoUrl: profile.photo_url || '',
    homeAddress: profile.home_address || '-',
    rawDateOfBirth: profile.date_of_birth || '',
    dateOfBirth: formatDisplayDate(profile.date_of_birth),
    currentNote: latestAppointment?.reason || latestAppointment?.service_name || '-',
    lastVisit: formatDisplayDate(latestAppointment?.appointment_date),
    allergies: medicalHistory?.allergies || '-',
    medication: medicalHistory?.current_medication || '-',
    familyHistory: medicalHistory?.family_history || '-',
    currentConditions: medicalHistory?.current_conditions || '-',
    pastSurgery: medicalHistory?.past_surgery || '-',
    bloodType: medicalHistory?.blood_type || '-',
    emergencyContact:
      emergencyContact?.contact_name || '-',
    emergencyRelationship: emergencyContact?.relationship || '-',
    emergencyPhoneNumber: emergencyContact?.phone_number || '-',
    emergencyAlternateNumber: emergencyContact?.alternate_number || '-',
    emergencyAddress: emergencyContact?.address || '-',
    recentAppointments,
  }
}

export const upsertCurrentPatientEmergencyContact = async ({
  contactName,
  relationship,
  phoneNumber,
  alternateNumber,
  address,
}) => {
  const userId = await getCurrentAuthenticatedUserId()

  const { error } = await supabase.from(patientEmergencyContactsTable).upsert(
    {
      patient_id: userId,
      contact_name: contactName,
      relationship,
      phone_number: phoneNumber,
      alternate_number: alternateNumber,
      address,
    },
    {
      onConflict: 'patient_id',
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return getCurrentPatientEmergencyContact()
}

export const upsertDoctorPatientEmergencyContact = async (
  patientId,
  { contactName, relationship, phoneNumber, alternateNumber, address },
) => {
  const { error } = await supabase.from(patientEmergencyContactsTable).upsert(
    {
      patient_id: patientId,
      contact_name: contactName,
      relationship,
      phone_number: phoneNumber,
      alternate_number: alternateNumber,
      address,
    },
    {
      onConflict: 'patient_id',
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return getDoctorPatientById(patientId)
}
