const appointmentDraftStorageKey = 'mycure_appointment_draft'

export const saveAppointmentDraft = (draft) => {
  localStorage.setItem(appointmentDraftStorageKey, JSON.stringify(draft))
}

export const getAppointmentDraft = () => {
  const storedDraft = localStorage.getItem(appointmentDraftStorageKey)

  if (!storedDraft) {
    return null
  }

  try {
    return JSON.parse(storedDraft)
  } catch {
    return null
  }
}

export const clearAppointmentDraft = () => {
  localStorage.removeItem(appointmentDraftStorageKey)
}
