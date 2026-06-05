import { supabase } from '../lib/supabaseClient'

const weeklyAvailabilityTable = 'clinic_weekly_availability'
const clinicClosuresTable = 'clinic_closures'

const defaultWeeklySchedule = [
  { weekday: 1, dayName: 'Monday', isOpen: true, startTime: '09:00', endTime: '17:00', slotIntervalMinutes: 30, availableSlots: [] },
  { weekday: 2, dayName: 'Tuesday', isOpen: true, startTime: '09:00', endTime: '17:00', slotIntervalMinutes: 30, availableSlots: [] },
  { weekday: 3, dayName: 'Wednesday', isOpen: true, startTime: '09:00', endTime: '17:00', slotIntervalMinutes: 30, availableSlots: [] },
  { weekday: 4, dayName: 'Thursday', isOpen: true, startTime: '09:00', endTime: '17:00', slotIntervalMinutes: 30, availableSlots: [] },
  { weekday: 5, dayName: 'Friday', isOpen: true, startTime: '09:00', endTime: '17:00', slotIntervalMinutes: 30, availableSlots: [] },
  { weekday: 6, dayName: 'Saturday', isOpen: false, startTime: '09:00', endTime: '13:00', slotIntervalMinutes: 30, availableSlots: [] },
  { weekday: 0, dayName: 'Sunday', isOpen: false, startTime: '09:00', endTime: '13:00', slotIntervalMinutes: 30, availableSlots: [] },
]

const toDateInputValue = (dateString) => {
  if (!dateString) return ''
  if (typeof dateString === 'string') {
    const trimmed = dateString.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed
    }
    if (trimmed.includes('T')) {
      return trimmed.slice(0, 10)
    }
  }

  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) return String(dateString)

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplayDate = (dateString) => {
  if (!dateString) return '-'
  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) return dateString
  return parsed.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const mapScheduleRow = (row) => ({
  weekday: row.weekday,
  dayName: row.day_name,
  isOpen: row.is_open,
  startTime: String(row.start_time || '09:00').slice(0, 5),
  endTime: String(row.end_time || '17:00').slice(0, 5),
  slotIntervalMinutes: row.slot_interval_minutes || 30,
  availableSlots:
    Array.isArray(row.available_slots) && row.available_slots.length
      ? [...row.available_slots].map((slot) => String(slot).slice(0, 5)).sort()
      : buildTimeSlots(
          String(row.start_time || '09:00').slice(0, 5),
          String(row.end_time || '17:00').slice(0, 5),
          row.slot_interval_minutes || 30,
        ),
})

const mapClosureRow = (row) => ({
  id: String(row.id),
  closureDate: toDateInputValue(row.closure_date),
  displayDate: formatDisplayDate(row.closure_date),
  isFullDay: row.is_full_day ?? true,
  startTime: row.start_time ? String(row.start_time).slice(0, 5) : '',
  endTime: row.end_time ? String(row.end_time).slice(0, 5) : '',
})

const mergeScheduleWithDefaults = (rows) => {
  const rowMap = new Map((rows || []).map((row) => [row.weekday, mapScheduleRow(row)]))
  return defaultWeeklySchedule.map((day) => rowMap.get(day.weekday) || { ...day })
}

const buildTimeSlots = (startTime, endTime, intervalMinutes) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)

  let current = startHours * 60 + startMinutes
  const end = endHours * 60 + endMinutes
  const slots = []

  while (current <= end) {
    const hours = String(Math.floor(current / 60)).padStart(2, '0')
    const minutes = String(current % 60).padStart(2, '0')
    slots.push(`${hours}:${minutes}`)
    current += intervalMinutes
  }

  return slots
}

export const getAvailabilitySettings = async () => {
  const [{ data: scheduleRows, error: scheduleError }, { data: closureRows, error: closureError }] =
    await Promise.all([
      supabase.from(weeklyAvailabilityTable).select('*').order('weekday', { ascending: true }),
      supabase.from(clinicClosuresTable).select('*').order('closure_date', { ascending: true }),
    ])

  if (scheduleError) {
    throw new Error(scheduleError.message)
  }

  if (closureError) {
    throw new Error(closureError.message)
  }

  return {
    weeklySchedule: mergeScheduleWithDefaults(scheduleRows),
    closures: (closureRows || []).map(mapClosureRow),
  }
}

export const saveWeeklyAvailability = async (schedule) => {
  const payload = schedule.map((day) => ({
    weekday: day.weekday,
    day_name: day.dayName,
    is_open: day.isOpen,
    start_time: day.availableSlots?.[0] || day.startTime || '09:00',
    end_time: day.availableSlots?.[day.availableSlots.length - 1] || day.endTime || '17:00',
    slot_interval_minutes: day.slotIntervalMinutes || 30,
    available_slots: day.availableSlots || [],
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from(weeklyAvailabilityTable).upsert(payload, {
    onConflict: 'weekday',
  })

  if (error) {
    throw new Error(error.message)
  }

  return getAvailabilitySettings()
}

export const addClinicClosure = async ({ closureDate, isFullDay, startTime, endTime }) => {
  const { error } = await supabase.from(clinicClosuresTable).upsert(
    {
      closure_date: closureDate,
      is_full_day: isFullDay,
      start_time: isFullDay ? null : startTime,
      end_time: isFullDay ? null : endTime,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'closure_date' },
  )

  if (error) {
    throw new Error(error.message)
  }

  return getAvailabilitySettings()
}

export const removeClinicClosure = async (id) => {
  const { error } = await supabase.from(clinicClosuresTable).delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return getAvailabilitySettings()
}

export const getAvailableSlotsForDate = ({ weeklySchedule, closures }, dateString) => {
  if (!dateString) {
    return {
      slots: [],
      isClosed: false,
      closureNote: '',
    }
  }

  const closure = (closures || []).find((item) => item.closureDate === dateString)
  if (closure?.isFullDay) {
    return {
      slots: [],
      isClosed: true,
      closureNote: 'Clinic is closed on the selected date.',
    }
  }

  const parsedDate = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      slots: [],
      isClosed: false,
      closureNote: '',
    }
  }

  const weekday = parsedDate.getDay()
  const daySchedule = (weeklySchedule || []).find((item) => item.weekday === weekday)

  if (!daySchedule || !daySchedule.isOpen) {
    return {
      slots: [],
      isClosed: true,
      closureNote: 'Clinic is closed on the selected day.',
    }
  }

  let slots = daySchedule.availableSlots?.length
    ? [...daySchedule.availableSlots]
    : buildTimeSlots(daySchedule.startTime, daySchedule.endTime, daySchedule.slotIntervalMinutes || 30)

  if (closure?.startTime && closure?.endTime) {
    slots = slots.filter((slot) => slot < closure.startTime || slot > closure.endTime)
  }

  const hasPartialClosure = Boolean(closure?.startTime && closure?.endTime)

  return {
    slots,
    isClosed: !slots.length,
    closureNote: hasPartialClosure
      ? `Clinic is closed from ${closure.startTime} to ${closure.endTime} on the selected date.`
      : '',
  }
}

export const defaultAvailabilitySchedule = defaultWeeklySchedule
