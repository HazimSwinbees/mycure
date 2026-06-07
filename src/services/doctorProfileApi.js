import { supabase } from '../lib/supabaseClient'

const doctorProfilesTable = 'doctor_profiles'
const doctorPhotosBucket = 'doctor-photos'
const fallbackPhotosBucket = 'patient-photos'

const defaultDoctorProfile = {
  id: '',
  fullName: '',
  roleTitle: '',
  qualification: '',
  experience: '',
  languages: [],
  specializations: [],
  workingHours: [],
  about: '',
  photoUrl: '',
}

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_')

const mapDoctorProfile = (record) => ({
  id: record?.id || defaultDoctorProfile.id,
  fullName: record?.full_name || defaultDoctorProfile.fullName,
  roleTitle: record?.role_title || defaultDoctorProfile.roleTitle,
  qualification: record?.qualification || defaultDoctorProfile.qualification,
  experience: record?.experience || defaultDoctorProfile.experience,
  languages: toArray(record?.languages).length
    ? toArray(record?.languages)
    : defaultDoctorProfile.languages,
  specializations: toArray(record?.specializations).length
    ? toArray(record?.specializations)
    : defaultDoctorProfile.specializations,
  workingHours: toArray(record?.working_hours).length
    ? toArray(record?.working_hours)
    : defaultDoctorProfile.workingHours,
  about: record?.about || defaultDoctorProfile.about,
  photoUrl: record?.photo_url || defaultDoctorProfile.photoUrl,
})

const uploadDoctorPhoto = async (userId, photo) => {
  if (!photo) {
    return ''
  }

  const photoPath = `${userId}/${Date.now()}-${sanitizeFileName(photo.name)}`

  for (const bucketName of [doctorPhotosBucket, fallbackPhotosBucket]) {
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(photoPath, photo, {
        contentType: photo.type,
        upsert: true,
      })

    if (!uploadError) {
      const { data } = supabase.storage.from(bucketName).getPublicUrl(photoPath)
      return data.publicUrl || ''
    }

    if (!/bucket not found/i.test(uploadError.message || '')) {
      throw new Error(uploadError.message)
    }
  }

  throw new Error('Photo storage bucket was not found.')
}

const getCurrentDoctorUser = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  const user = data?.user

  if (!user?.id) {
    throw new Error('You must be signed in to manage the doctor profile.')
  }

  return user
}

export const getCurrentDoctorProfile = async () => {
  const user = await getCurrentDoctorUser()

  const { data, error } = await supabase
    .from(doctorProfilesTable)
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    const metadata = user.user_metadata || {}

    return {
      ...defaultDoctorProfile,
      fullName: metadata.name || defaultDoctorProfile.fullName,
    }
  }

  return mapDoctorProfile(data)
}

export const getDoctorProfiles = async () => {
  const { data, error } = await supabase
    .from(doctorProfilesTable)
    .select('*')
    .order('full_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(mapDoctorProfile)
}

export const updateCurrentDoctorProfile = async ({
  fullName,
  roleTitle,
  qualification,
  experience,
  languages,
  specializations,
  workingHours,
  about,
  photoUrl,
  photoFile,
}) => {
  const user = await getCurrentDoctorUser()
  const uploadedPhotoUrl = photoFile ? await uploadDoctorPhoto(user.id, photoFile) : ''

  const payload = {
    id: user.id,
    full_name: String(fullName || '').trim() || defaultDoctorProfile.fullName,
    role_title: String(roleTitle || '').trim() || defaultDoctorProfile.roleTitle,
    qualification: String(qualification || '').trim() || defaultDoctorProfile.qualification,
    experience: String(experience || '').trim() || defaultDoctorProfile.experience,
    languages: toArray(languages).length ? toArray(languages) : defaultDoctorProfile.languages,
    specializations: toArray(specializations).length
      ? toArray(specializations)
      : defaultDoctorProfile.specializations,
    working_hours: toArray(workingHours).length
      ? toArray(workingHours)
      : defaultDoctorProfile.workingHours,
    about: String(about || '').trim() || defaultDoctorProfile.about,
    photo_url: uploadedPhotoUrl || String(photoUrl || '').trim(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(doctorProfilesTable)
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapDoctorProfile(data)
}
