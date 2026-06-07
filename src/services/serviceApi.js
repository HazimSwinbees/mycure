import { supabase } from '../lib/supabaseClient'

const servicesTable = 'services'

const pickFirst = (record, keys, fallback = '') => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null && record[key] !== '') {
      return record[key]
    }
  }

  return fallback
}

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (!trimmed) {
      return []
    }

    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean)
      }
    } catch {
      // Keep string parsing fallback below.
    }

    return trimmed
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const toBoolean = (value, fallback = true) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
  }

  return fallback
}

const toNumber = (value) => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const formatQuarterHourDuration = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.max(15, Math.round(value / 15) * 15)
    return `${rounded} min`
  }

  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim()
    const numericMatch = trimmed.match(/(\d+(?:\.\d+)?)/)

    if (!numericMatch) {
      return trimmed
    }

    const minutes = Number(numericMatch[1])
    if (!Number.isFinite(minutes)) {
      return trimmed
    }

    const rounded = Math.max(15, Math.round(minutes / 15) * 15)
    return `${rounded} min`
  }

  return 'Not specified'
}

const formatPrice = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `RM${value}`
  }

  if (typeof value === 'string' && value.trim()) {
    const numericMatch = value.trim().match(/(\d+(?:\.\d+)?)/)

    if (!numericMatch) {
      return value.trim()
    }

    return `RM${numericMatch[1]}`
  }

  return ''
}

const slugifyServiceId = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const mapServiceRecord = (record) => ({
  id: String(pickFirst(record, ['id', 'slug'], '')),
  name: pickFirst(record, ['name', 'service_name'], 'Service'),
  category: pickFirst(record, ['category', 'service_category'], 'General'),
  description: pickFirst(record, ['description', 'short_description'], ''),
  overview: pickFirst(record, ['overview', 'description', 'full_description'], ''),
  doctor: pickFirst(record, ['doctor', 'provider_name', 'assigned_doctor'], '-'),
  duration: formatQuarterHourDuration(pickFirst(record, ['duration', 'duration_label'], 'Not specified')),
  slot: pickFirst(record, ['slot', 'next_slot', 'next_available_slot'], 'Contact clinic'),
  price: pickFirst(record, ['price', 'price_label', 'fee'], 'Contact clinic'),
  rating: toNumber(pickFirst(record, ['rating', 'average_rating'], null)),
  reviews: toNumber(pickFirst(record, ['reviews', 'review_count'], null)),
  available: toBoolean(pickFirst(record, ['available', 'is_available', 'bookable'], true), true),
  location: pickFirst(record, ['location', 'clinic_location'], '-'),
  preparation: pickFirst(record, ['preparation', 'preparation_notes'], 'No special preparation required.'),
  includes: toArray(pickFirst(record, ['includes', 'included_items', 'service_includes'], [])),
})

const mapServicePayload = (service) => {
  const name = String(service?.name || '').trim()
  const category = String(service?.category || '').trim() || 'General'
  const id = slugifyServiceId(service?.id || name)

  if (!name) {
    throw new Error('Service name is required.')
  }

  if (!id) {
    throw new Error('Unable to generate a service ID.')
  }

  return {
    id,
    name,
    category,
    description: String(service?.description || '').trim(),
    overview: String(service?.overview || '').trim(),
    duration: formatQuarterHourDuration(service?.duration || ''),
    price: formatPrice(service?.price),
    available: Boolean(service?.available),
    preparation: String(service?.preparation || '').trim(),
    includes: toArray(service?.includes),
    updated_at: new Date().toISOString(),
  }
}

export const getServices = async () => {
  const { data, error } = await supabase.from(servicesTable).select('*').order('name')

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(mapServiceRecord)
}

export const getServiceById = async (id) => {
  const { data, error } = await supabase
    .from(servicesTable)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapServiceRecord(data) : null
}

export const getDoctorServices = getServices

export const createDoctorService = async (service) => {
  const payload = mapServicePayload(service)

  const { data, error } = await supabase.from(servicesTable).insert(payload).select('*').single()

  if (error) {
    throw new Error(error.message)
  }

  return mapServiceRecord(data)
}

export const updateDoctorService = async (id, service) => {
  const payload = mapServicePayload({ ...service, id })

  const { data, error } = await supabase
    .from(servicesTable)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapServiceRecord(data)
}

export const deleteDoctorService = async (id) => {
  const { error } = await supabase.from(servicesTable).delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
