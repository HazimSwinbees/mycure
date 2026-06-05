<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { saveAppointmentDraft } from '../../services/appointmentDraft'
import { getServices } from '../../services/serviceApi'
import { getAvailabilitySettings, getAvailableSlotsForDate } from '../../services/availabilityApi'
import { getBookedAppointmentsForDate } from '../../services/appointmentApi'

const route = useRoute()
const router = useRouter()
const services = ref([])
const servicesError = ref('')
const isLoadingServices = ref(true)
const availabilitySettings = ref({ weeklySchedule: [], closures: [] })
const availabilityError = ref('')
const isLoadingAvailability = ref(true)
const availableSlots = ref([])
const isClinicClosed = ref(false)
const closureMessage = ref('')
const isLoadingBookedSlots = ref(false)
const bookedSlotsError = ref('')

const selectedServiceId = ref('')
const selectedDate = ref('')
const selectedTime = ref('')
const reasonForVisit = ref('')

const todayDate = new Date()
todayDate.setHours(0, 0, 0, 0)

const minBookingDate = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(
  todayDate.getDate(),
).padStart(2, '0')}`

const selectedService = computed(
  () => services.value.find((service) => service.id === selectedServiceId.value) || null,
)

const canContinue = computed(
  () =>
    Boolean(selectedService.value) &&
    Boolean(selectedDate.value) &&
    Boolean(selectedTime.value) &&
    Boolean(reasonForVisit.value.trim()),
)

const parseDurationMinutes = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const match = value.match(/(\d+(?:\.\d+)?)/)
    if (match) {
      const parsed = Number(match[1])
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return 0
}

const toMinutes = (timeString) => {
  if (!timeString || !timeString.includes(':')) {
    return null
  }

  const [hours, minutes] = timeString.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null
  }

  return hours * 60 + minutes
}

const hasOverlap = (slotTime, slotDuration, appointmentTime, appointmentDuration) => {
  const slotStart = toMinutes(slotTime)
  const appointmentStart = toMinutes(appointmentTime)

  if (slotStart === null || appointmentStart === null) {
    return false
  }

  const slotEnd = slotStart + slotDuration
  const appointmentEnd = appointmentStart + appointmentDuration

  return slotStart < appointmentEnd && appointmentStart < slotEnd
}

const applyRoutePrefill = () => {
  const requestedServiceId = String(route.query.serviceId || '')
  const requestedReason = typeof route.query.reason === 'string' ? route.query.reason.trim() : ''

  if (requestedServiceId && services.value.some((service) => service.id === requestedServiceId)) {
    selectedServiceId.value = requestedServiceId
  }

  if (requestedReason) {
    reasonForVisit.value = requestedReason
  }
}

const loadServices = async () => {
  isLoadingServices.value = true
  servicesError.value = ''

  try {
    const results = await getServices()
    services.value = results.filter((service) => service.available)
    applyRoutePrefill()
  } catch (error) {
    servicesError.value = error.message || 'Unable to load services right now.'
  } finally {
    isLoadingServices.value = false
  }
}

const refreshAvailableSlots = async () => {
  const { slots, isClosed, closureNote } = getAvailableSlotsForDate(
    availabilitySettings.value,
    selectedDate.value,
  )

  bookedSlotsError.value = ''
  isLoadingBookedSlots.value = Boolean(selectedDate.value)

  let bookedAppointments = []

  if (selectedDate.value) {
    try {
      bookedAppointments = await getBookedAppointmentsForDate(selectedDate.value)
    } catch (error) {
      bookedSlotsError.value = error.message || 'Unable to verify booked times right now.'
    }
  }

  const selectedServiceDuration = parseDurationMinutes(selectedService.value?.duration)

  availableSlots.value = slots.filter((slot) => {
    if (!selectedServiceDuration) {
      return true
    }

    return !bookedAppointments.some((appointment) =>
      hasOverlap(
        slot,
        selectedServiceDuration,
        appointment.time,
        parseDurationMinutes(appointment.duration),
      ),
    )
  })
  isClinicClosed.value = isClosed
  closureMessage.value = closureNote
  isLoadingBookedSlots.value = false

  if (!availableSlots.value.includes(selectedTime.value)) {
    selectedTime.value = ''
  }
}

const loadAvailability = async () => {
  isLoadingAvailability.value = true
  availabilityError.value = ''

  try {
    availabilitySettings.value = await getAvailabilitySettings()
    refreshAvailableSlots()
  } catch (error) {
    availabilityError.value = error.message || 'Unable to load clinic availability.'
  } finally {
    isLoadingAvailability.value = false
  }
}

const handleBookAppointment = () => {
  if (!canContinue.value || !selectedService.value) {
    return
  }

  saveAppointmentDraft({
    serviceId: selectedService.value.id,
    serviceName: selectedService.value.name,
    serviceDuration: selectedService.value.duration,
    serviceLocation: selectedService.value.location,
    serviceCategory: selectedService.value.category,
    doctorName: selectedService.value.doctor,
    date: selectedDate.value,
    time: selectedTime.value,
    reason: reasonForVisit.value.trim(),
    confirmed: false,
  })

  router.push({ name: 'booking-confirmation' })
}

watch(selectedDate, () => {
  if (selectedDate.value && selectedDate.value < minBookingDate) {
    selectedDate.value = minBookingDate
    return
  }

  refreshAvailableSlots()
})

watch(selectedServiceId, () => {
  if (selectedDate.value) {
    refreshAvailableSlots()
  }
})

watch(
  () => route.query,
  () => {
    applyRoutePrefill()
  },
)

onMounted(async () => {
  applyRoutePrefill()
  await Promise.all([loadServices(), loadAvailability()])
})
</script>

<template>
  <section class="booking-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Appointment</p>
        <h1>Book an appointment</h1>
        <p class="muted-copy">
          Choose a service, confirm your preferred slot, and review the request before submission.
        </p>
      </div>
    </section>

    <section class="panel booking-panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Booking form</p>
            <h2>Appointment details</h2>
          </div>
        </div>

        <form class="booking-form" @submit.prevent="handleBookAppointment">
          <section class="form-section">
            <div class="section-head">
              <span class="step-chip">01</span>
              <div>
                <h3>Service Selected</h3>
                <p>Select the clinic service you want to book.</p>
              </div>
            </div>

            <div class="field">
              <label for="service">Service</label>
              <select
                id="service"
                v-model="selectedServiceId"
                :disabled="isLoadingServices || !!servicesError"
                required
              >
                <option value="">Select a service</option>
                <option v-for="service in services" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
              <small v-if="isLoadingServices" class="field-hint"
                >Loading services from the database.</small
              >
              <small v-else-if="servicesError" class="field-hint error-text">{{
                servicesError
              }}</small>
            </div>

            <div v-if="selectedService" class="service-preview">
              <div>
                <strong>{{ selectedService.name }}</strong>
                <p>{{ selectedService.description }}</p>
              </div>
              <div class="service-meta">
                <span>{{ selectedService.duration }}</span>
                <span>{{ selectedService.location }}</span>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-head">
              <span class="step-chip">02</span>
              <div>
                <h3>Date Selection</h3>
                <p>Pick your preferred appointment date.</p>
              </div>
            </div>

            <div class="field">
              <label for="date">Appointment date</label>
              <input id="date" v-model="selectedDate" :min="minBookingDate" type="date" required />
            </div>
          </section>

          <section class="form-section">
            <div class="section-head">
              <span class="step-chip">03</span>
              <div>
                <h3>Time Slot Selection</h3>
                <p>Choose an available time for your visit.</p>
              </div>
            </div>

            <div class="slot-panel">
              <span>Available slots</span>
              <small v-if="isLoadingAvailability || isLoadingBookedSlots" class="field-hint">Loading clinic availability.</small>
              <small v-else-if="availabilityError" class="field-hint error-text">{{ availabilityError }}</small>
              <small v-else-if="bookedSlotsError" class="field-hint error-text">{{ bookedSlotsError }}</small>
              <small v-else-if="isClinicClosed" class="field-hint error-text">{{ closureMessage }}</small>
              <small v-else-if="closureMessage" class="field-hint">{{ closureMessage }}</small>
              <small v-else-if="selectedDate && !availableSlots.length" class="field-hint">
                No booking slots are available on the selected date.
              </small>
              <div class="slot-list">
                <button
                  v-for="slot in availableSlots"
                  :key="slot"
                  :class="{ active: selectedTime === slot }"
                  type="button"
                  @click="selectedTime = slot"
                >
                  {{ slot }}
                </button>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-head">
              <span class="step-chip">04</span>
              <div>
                <h3>Reason for Visit</h3>
                <p>Provide a short note for the clinic.</p>
              </div>
            </div>

            <div class="field">
              <label for="notes">Reason for visit</label>
              <textarea
                id="notes"
                v-model="reasonForVisit"
                rows="5"
                placeholder="Briefly describe your symptoms, concerns, or follow-up request"
              ></textarea>
            </div>
          </section>

          <div class="form-actions">
            <RouterLink class="secondary-link" :to="{ name: 'services' }">
              Back to services
            </RouterLink>
            <button class="primary-button" :disabled="!canContinue" type="submit">
              Book Appointment
            </button>
          </div>
        </form>
    </section>
  </section>
</template>

<style scoped>
.booking-page,
.booking-form {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.hero-panel,
.panel {
  padding: 1.25rem;
}

.hero-copy,
.field,
.section-head,
.service-preview,
.service-meta {
  display: grid;
  gap: 0.45rem;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-copy h1,
.panel-head h2,
.section-head h3 {
  color: #111827;
  font-weight: 700;
  letter-spacing: 0;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.section-head h3 {
  font-size: 1rem;
}

.muted-copy,
.section-head p,
.field-hint,
.service-preview p,
.service-meta span,
.slot-panel span {
  color: #6b7280;
}

.error-text {
  color: #b42318;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.form-section {
  display: grid;
  gap: 1rem;
  border: 1px solid #edf2f7;
  border-radius: 12px;
  background: #fbfcfe;
  padding: 1rem;
}

.section-head {
  grid-template-columns: auto 1fr;
  align-items: start;
}

.step-chip {
  display: inline-flex;
  min-width: 2rem;
  min-height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #edf3ff;
  color: #3157b7;
  font-size: 0.78rem;
  font-weight: 700;
}

.field label {
  color: #111827;
  font-size: 0.92rem;
  font-weight: 600;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  padding: 0.8rem 0.9rem;
}

.service-preview {
  border: 1px solid #dbe6fb;
  border-radius: 12px;
  background: #f7faff;
  padding: 0.95rem;
}

.service-preview strong,
.summary-row strong {
  color: #111827;
  font-weight: 600;
}

.service-meta {
  gap: 0.25rem;
}

.slot-panel {
  display: grid;
  gap: 0.8rem;
  border: 1px solid #e8eef9;
  border-radius: 12px;
  background: #ffffff;
  padding: 1rem;
}

.slot-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.slot-list button {
  min-height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  font-weight: 600;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease;
}

.slot-list button.active,
.slot-list button:hover {
  border-color: #3157b7;
  background: #3157b7;
  color: #ffffff;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.secondary-link,
.primary-button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.secondary-link {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
}

.primary-button {
  border: 0;
  background: #111827;
  color: #ffffff;
}

.primary-button:disabled {
  cursor: not-allowed;
  background: #9ca3af;
}

@media (min-width: 760px) {
  .slot-list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .form-actions > * {
    width: 100%;
  }
}
</style>
