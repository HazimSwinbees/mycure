import { supabase } from '../lib/supabaseClient'

const clinicInfoTable = 'clinic_info'

const defaultClinicInfo = {
  id: 1,
  clinicName: 'MyCure Central Clinic',
  tagline: 'Modern primary care with clear digital access.',
  email: 'hello@mycure.com',
  phone: '+60 12 345 6789',
  addressLine1: 'Lot 12, Jalan Clinic Sentral',
  addressLine2: 'Kuching, Sarawak 93350',
  operatingHours: 'Monday - Friday, 9:00 AM - 5:00 PM',
  website: 'https://mycure.example',
  description:
    'MyCure supports daily consultations, follow-up care, preventive screening, and coordinated clinic operations from one connected platform.',
  emergencyNote: 'For urgent emergencies, call local emergency services or go to the nearest hospital.',
}

const mapClinicInfoRecord = (record) => ({
  id: record?.id ?? defaultClinicInfo.id,
  clinicName: record?.clinic_name || defaultClinicInfo.clinicName,
  tagline: record?.tagline || defaultClinicInfo.tagline,
  email: record?.email || defaultClinicInfo.email,
  phone: record?.phone || defaultClinicInfo.phone,
  addressLine1: record?.address_line_1 || defaultClinicInfo.addressLine1,
  addressLine2: record?.address_line_2 || defaultClinicInfo.addressLine2,
  operatingHours: record?.operating_hours || defaultClinicInfo.operatingHours,
  website: record?.website || defaultClinicInfo.website,
  description: record?.description || defaultClinicInfo.description,
  emergencyNote: record?.emergency_note || defaultClinicInfo.emergencyNote,
})

export const getClinicInfo = async () => {
  const { data, error } = await supabase.from(clinicInfoTable).select('*').eq('id', 1).maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return mapClinicInfoRecord(data)
}

export const updateClinicInfo = async (clinicInfo) => {
  const payload = {
    id: 1,
    clinic_name: String(clinicInfo?.clinicName || '').trim() || defaultClinicInfo.clinicName,
    tagline: String(clinicInfo?.tagline || '').trim() || defaultClinicInfo.tagline,
    email: String(clinicInfo?.email || '').trim() || defaultClinicInfo.email,
    phone: String(clinicInfo?.phone || '').trim() || defaultClinicInfo.phone,
    address_line_1:
      String(clinicInfo?.addressLine1 || '').trim() || defaultClinicInfo.addressLine1,
    address_line_2:
      String(clinicInfo?.addressLine2 || '').trim() || defaultClinicInfo.addressLine2,
    operating_hours:
      String(clinicInfo?.operatingHours || '').trim() || defaultClinicInfo.operatingHours,
    website: String(clinicInfo?.website || '').trim() || defaultClinicInfo.website,
    description: String(clinicInfo?.description || '').trim() || defaultClinicInfo.description,
    emergency_note:
      String(clinicInfo?.emergencyNote || '').trim() || defaultClinicInfo.emergencyNote,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(clinicInfoTable)
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapClinicInfoRecord(data)
}
