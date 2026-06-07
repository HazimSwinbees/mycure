<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createAppointment } from '../../services/appointmentApi'
import { createPatientNotification } from '../../services/notificationApi'
import { clearAppointmentDraft, getAppointmentDraft, saveAppointmentDraft } from '../../services/appointmentDraft'

const router = useRouter()
const draft = ref(getAppointmentDraft())
const isSubmitting = ref(false)
const errorMessage = ref('')

const formattedDate = computed(() => {
  if (!draft.value?.date) {
    return 'Not selected'
  }

  const parsedDate = new Date(draft.value.date)

  if (Number.isNaN(parsedDate.getTime())) {
    return draft.value.date
  }

  return parsedDate.toLocaleDateString('en-MY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})

const confirmBooking = async () => {
  if (!draft.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const appointment = await createAppointment(draft.value)

    await createPatientNotification({
      patientId: appointment.patientId,
      title: 'Appointment booked successfully',
      body: `${appointment.service} has been booked for ${appointment.date} at ${appointment.time}.`,
      type: 'Appointment',
    })

    draft.value = {
      ...draft.value,
      confirmed: true,
      appointmentId: appointment.id,
      status: appointment.status,
    }

    saveAppointmentDraft(draft.value)

    const successRoute = router.resolve({ name: 'booking-success' })
    await router.push(successRoute)

    if (window.location.pathname !== successRoute.href) {
      window.location.assign(successRoute.href)
    }
  } catch (error) {
    errorMessage.value = error.message || 'Unable to confirm the booking right now.'
  } finally {
    isSubmitting.value = false
  }
}

const clearAndReturn = () => {
  clearAppointmentDraft()
}
</script>

<template>
  <section class="confirmation-page">
    <section v-if="draft" class="confirmation-layout">
      <section class="panel hero-panel">
        <div class="hero-copy">
          <p class="section-label">Confirm Appointment</p>
          <h1>Review your booking</h1>
          <p class="muted-copy">
            Check the appointment details before sending the final confirmation.
          </p>
        </div>
      </section>

      <div class="content-grid">
        <section class="panel details-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Appointment Summary</p>
              <h2>Booking details</h2>
            </div>
          </div>

          <div class="summary-list">
            <article class="summary-row">
              <span>Service</span>
              <strong>{{ draft.serviceName }}</strong>
            </article>
            <article class="summary-row">
              <span>Category</span>
              <strong>{{ draft.serviceCategory }}</strong>
            </article>
            <article class="summary-row">
              <span>Doctor</span>
              <strong>{{ draft.doctorName || '-' }}</strong>
            </article>
            <article class="summary-row">
              <span>Date</span>
              <strong>{{ formattedDate }}</strong>
            </article>
            <article class="summary-row">
              <span>Time</span>
              <strong>{{ draft.time }}</strong>
            </article>
            <article class="summary-row">
              <span>Duration</span>
              <strong>{{ draft.serviceDuration }}</strong>
            </article>
            <article class="summary-row">
              <span>Location</span>
              <strong>{{ draft.serviceLocation }}</strong>
            </article>
          </div>

          <div class="reason-panel">
            <span>Reason for visit</span>
            <p>{{ draft.reason }}</p>
          </div>
        </section>

        <aside class="panel action-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Status</p>
              <h2>Ready to confirm</h2>
            </div>
          </div>

          <div class="action-copy">
            <p class="muted-copy">
              Confirm this booking to open the success page and mark the appointment as confirmed.
            </p>
            <div v-if="errorMessage" class="error-panel">
              <strong>Booking could not be saved</strong>
              <p>{{ errorMessage }}</p>
            </div>
            <button class="primary-button full-width" :disabled="isSubmitting" @click="confirmBooking">
              {{ isSubmitting ? 'Saving booking...' : 'Confirm Booked' }}
            </button>
            <RouterLink class="secondary-link full-width" :to="{ name: 'booking' }">
              Back to edit
            </RouterLink>
          </div>
        </aside>
      </div>
    </section>

    <section v-else class="panel empty-panel">
      <p class="section-label">Confirm Appointment</p>
      <h1>No booking details found</h1>
      <p class="muted-copy">Start from the booking page before opening the confirmation step.</p>
      <RouterLink class="primary-link" :to="{ name: 'booking' }">Back to booking</RouterLink>
    </section>
  </section>
</template>

<style scoped>
.confirmation-page,
.confirmation-layout,
.summary-list,
.action-copy {
  display: grid;
  gap: 1rem;
}

.panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  padding: 1.25rem;
}

.hero-panel,
.hero-copy,
.reason-panel {
  display: grid;
  gap: 0.45rem;
}

.hero-panel {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-copy h1,
.panel-head h2,
.empty-panel h1 {
  color: #111827;
  font-weight: 700;
  letter-spacing: 0;
}

.hero-copy h1,
.empty-panel h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.summary-row span,
.reason-panel p {
  color: #6b7280;
}

.error-text {
  color: #b42318;
  font-size: 0.9rem;
}

.error-panel {
  display: grid;
  gap: 0.3rem;
  border: 1px solid #fecdca;
  border-radius: 12px;
  background: #fef3f2;
  padding: 0.9rem;
}

.error-panel strong {
  color: #b42318;
  font-weight: 700;
}

.error-panel p {
  color: #7a271a;
  margin: 0;
}

.content-grid {
  display: grid;
  gap: 1rem;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.summary-list {
  gap: 0;
  margin-top: 0.25rem;
}

.summary-row {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #f1f5f9;
  padding: 0.85rem 0;
}

.summary-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.summary-row:last-child {
  padding-bottom: 0;
}

.summary-row strong,
.reason-panel span {
  color: #111827;
  font-weight: 600;
}

.summary-row strong {
  max-width: 16ch;
  text-align: right;
}

.reason-panel {
  border: 1px solid #edf2f7;
  border-radius: 12px;
  background: #fbfcfe;
  padding: 0.95rem;
  margin-top: 1rem;
}

.primary-button,
.primary-link,
.secondary-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.primary-button,
.primary-link {
  border: 0;
  background: #111827;
  color: #ffffff;
}

.primary-button:disabled {
  cursor: not-allowed;
  background: #9ca3af;
}

.secondary-link {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
}

.full-width {
  width: 100%;
}

.empty-panel {
  display: grid;
  gap: 0.8rem;
}

@media (min-width: 1080px) {
  .content-grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    align-items: start;
  }

  .action-panel {
    position: sticky;
    top: 1.5rem;
  }
}

@media (max-width: 640px) {
  .hero-panel,
  .summary-row {
    grid-template-columns: 1fr;
  }

  .summary-row {
    display: grid;
  }

  .summary-row strong {
    max-width: none;
    text-align: left;
  }
}
</style>
