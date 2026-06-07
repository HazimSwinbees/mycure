import { supabase } from '../lib/supabaseClient'

const patientPhotosBucket = 'patient-photos'
const patientProfilesTable = 'patient_profiles'
const doctorProfilesTable = 'doctor_profiles'

const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_')
const normalizeAuthError = (error) => {
  const message = error?.message || ''

  if (/user already registered/i.test(message)) {
    return 'This email is already registered. Please sign in or use a different email address.'
  }

  return message || 'Authentication request failed.'
}

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
    photoUrl: data.publicUrl || '',
  }
}

const uploadDoctorPhoto = async (userId, photo) => {
  if (!photo) {
    return ''
  }

  const photoPath = `${userId}/${Date.now()}-${sanitizeFileName(photo.name)}`

  for (const bucketName of ['doctor-photos', patientPhotosBucket]) {
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

const savePatientProfile = async (userId, form, photoPath, photoUrl) => {
  const { error } = await supabase.from(patientProfilesTable).upsert(
    {
      id: userId,
      first_name: form.firstName,
      last_name: form.lastName,
      full_name: `${form.firstName} ${form.lastName}`.trim(),
      ic_passport_number: form.icPassportNumber,
      date_of_birth: form.dateOfBirth,
      gender: form.gender,
      phone: form.phone,
      email: form.email,
      home_address: form.homeAddress,
      photo_path: photoPath,
      photo_url: photoUrl,
      role: 'patient',
    },
    {
      onConflict: 'id',
    },
  )

  if (error) {
    throw new Error(normalizeAuthError(error))
  }
}

const saveDoctorProfile = async (userId, form) => {
  const { error } = await supabase.from(doctorProfilesTable).upsert(
    {
      id: userId,
      full_name: form.fullName,
      role_title: form.roleTitle,
      qualification: form.qualification,
      experience: form.experience,
      languages: form.languages,
      specializations: form.specializations,
      working_hours: form.workingHours,
      about: form.about,
      photo_url: form.photoUrl,
    },
    {
      onConflict: 'id',
    },
  )

  if (error) {
    throw new Error(normalizeAuthError(error))
  }
}

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(normalizeAuthError(error))
  }

  return data
}

export const registerUser = async ({
  firstName,
  lastName,
  icPassportNumber,
  dateOfBirth,
  gender,
  phone,
  email,
  homeAddress,
  password,
  photo,
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`.trim(),
        ic_passport_number: icPassportNumber,
        date_of_birth: dateOfBirth,
        gender,
        phone,
        home_address: homeAddress,
        photo_name: photo?.name || '',
        photo_type: photo?.type || '',
        photo_size: photo?.size || 0,
        role: 'patient',
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  const userId = data.user?.id
  if (userId && data.session) {
    const { photoPath, photoUrl } = await uploadPatientPhoto(userId, photo)
    await savePatientProfile(
      userId,
      { firstName, lastName, icPassportNumber, dateOfBirth, gender, phone, email, homeAddress },
      photoPath,
      photoUrl,
    )
  }

  return data
}

export const registerDoctor = async ({
  fullName,
  email,
  password,
  roleTitle,
  qualification,
  experience,
  languages,
  specializations,
  workingHours,
  about,
  photo,
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: fullName,
        role_title: roleTitle,
        qualification,
        experience,
        photo_name: photo?.name || '',
        photo_type: photo?.type || '',
        photo_size: photo?.size || 0,
        role: 'doctor',
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  const userId = data.user?.id
  if (userId && data.session) {
    const photoUrl = await uploadDoctorPhoto(userId, photo)
    await saveDoctorProfile(userId, {
      fullName,
      roleTitle,
      qualification,
      experience,
      languages,
      specializations,
      workingHours,
      about,
      photoUrl,
    })
  }

  return data
}

export const requestPasswordReset = async (email) => {
  const appUrl = import.meta.env.VITE_APP_URL || 'https://mycure.vercel.app'
  const redirectTo = `${appUrl.replace(/\/$/, '')}/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export const updatePassword = async (password) => {
  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const logoutUser = () => supabase.auth.signOut()

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return data.session
}
