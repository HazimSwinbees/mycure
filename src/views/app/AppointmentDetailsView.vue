<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  getCurrentPatientAppointmentById,
  updateCurrentPatientAppointmentStatus,
} from '../../services/appointmentApi'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const appointment = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const saveError = ref('')
const isSaving = ref(false)
const showCancelModal = ref(false)

const reasonForm = reactive({
  reason: '',
})

const canCancel = computed(() =>
  ['Pending', 'Confirmed'].includes(appointment.value?.status),
)

const statusLabelClass = computed(() => {
  const status = (appointment.value?.status || '').toLowerCase()
  return ['status-badge', status]
})

const statusNoteTitle = computed(() => {
  if (appointment.value?.status === 'Cancelled') return 'Cancellation reason'
  if (appointment.value?.status === 'Rejected') return 'Rejection reason'
  return 'Status note'
})

const loadAppointment = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    appointment.value = await getCurrentPatientAppointmentById(props.id)
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load the appointment right now.'
  } finally {
    isLoading.value = false
  }
}

const openCancelModal = () => {
  reasonForm.reason = ''
  saveError.value = ''
  showCancelModal.value = true
}

const closeCancelModal = () => {
  if (isSaving.value) return
  reasonForm.reason = ''
  saveError.value = ''
  showCancelModal.value = false
}

const submitCancellation = async () => {
  if (!appointment.value?.id) return

  const trimmedReason = reasonForm.reason.trim()
  if (!trimmedReason) {
    saveError.value = 'Reason is required.'
    return
  }

  isSaving.value = true
  saveError.value = ''

  try {
    appointment.value = await updateCurrentPatientAppointmentStatus(appointment.value.id, {
      status: 'Cancelled',
      statusReason: trimmedReason,
    })
    closeCancelModal()
  } catch (error) {
    saveError.value = error.message || 'Unable to cancel the appointment.'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadAppointment)
</script>

<template>
  <section v-if="isLoading" class="details-page">
    <section class="panel state-panel">
      <p class="section-label">Appointment</p>
      <h1>Loading appointment</h1>
    </section>
  </section>

  <section v-else-if="errorMessage" class="details-page">
    <section class="panel state-panel">
      <p class="section-label">Appointment</p>
      <h1>Unable to load appointment</h1>
      <p class="muted-copy">{{ errorMessage }}</p>
      <RouterLink class="secondary-link" :to="{ name: 'appointments' }">
        Back to appointments
      </RouterLink>
    </section>
  </section>

  <section v-else-if="appointment" class="details-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Appointment details</p>
        <h1>{{ appointment.service }}</h1>
        <p class="muted-copy">Review booking details, visit timing, and any status updates from the clinic.</p>
      </div>

      <div class="hero-actions">
        <span :class="statusLabelClass">{{ appointment.status }}</span>
        <RouterLink class="secondary-link" :to="{ name: 'appointments' }">
          Back to appointments
        </RouterLink>
      </div>
    </section>

    <div class="details-grid">
      <section class="panel summary-card">
        <p class="section-label">Visit summary</p>
        <h2>{{ appointment.date }}</h2>
        <strong class="summary-time">{{ appointment.time }}</strong>
        <p class="muted-copy">{{ appointment.doctor }} at {{ appointment.location }}</p>

        <div class="summary-stack">
          <article class="summary-row">
            <span>Category</span>
            <strong>{{ appointment.category }}</strong>
          </article>
          <article class="summary-row">
            <span>Duration</span>
            <strong>{{ appointment.duration }}</strong>
          </article>
          <article class="summary-row">
            <span>Reference</span>
            <strong>{{ appointment.id }}</strong>
          </article>
        </div>
      </section>

      <div class="record-column">
        <section class="panel record-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Appointment details</p>
              <h2>Booking information</h2>
            </div>
          </div>

          <div class="record-grid">
            <article class="record-item">
              <span>Service</span>
              <strong>{{ appointment.service }}</strong>
            </article>
            <article class="record-item">
              <span>Status</span>
              <strong>{{ appointment.status }}</strong>
            </article>
            <article class="record-item">
              <span>Doctor</span>
              <strong>{{ appointment.doctor }}</strong>
            </article>
            <article class="record-item">
              <span>Location</span>
              <strong>{{ appointment.location }}</strong>
            </article>
            <article class="record-item record-wide">
              <span>Reason for visit</span>
              <strong>{{ appointment.notes || 'No notes provided.' }}</strong>
            </article>
          </div>
        </section>

        <section v-if="appointment.statusReason" class="panel record-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Status update</p>
              <h2>{{ statusNoteTitle }}</h2>
            </div>
          </div>

          <div class="record-grid single-grid">
            <article class="record-item">
              <span>{{ statusNoteTitle }}</span>
              <strong>{{ appointment.statusReason }}</strong>
            </article>
          </div>
        </section>

        <section v-if="canCancel" class="panel record-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Manage booking</p>
              <h2>Appointment actions</h2>
            </div>
          </div>

          <p v-if="saveError" class="inline-error" role="alert">{{ saveError }}</p>

          <div class="action-row">
            <button class="danger-button" type="button" :disabled="isSaving" @click="openCancelModal">
              Cancel appointment
            </button>
          </div>
        </section>
      </div>
    </div>

    <div
      v-if="showCancelModal"
      class="edit-modal-shell"
      role="dialog"
      aria-modal="true"
      @click.self="closeCancelModal"
    >
      <section class="edit-modal">
        <div class="edit-head">
          <div>
            <p class="section-label">Cancel appointment</p>
            <h2>Provide a reason</h2>
          </div>
          <button class="modal-close" type="button" aria-label="Close" @click="closeCancelModal">
            ×
          </button>
        </div>

        <form class="edit-form" @submit.prevent="submitCancellation">
          <label class="form-field">
            <span>Reason</span>
            <textarea
              v-model="reasonForm.reason"
              rows="4"
              placeholder="Tell the clinic why you need to cancel this appointment"
            />
          </label>

          <p v-if="saveError" class="save-error" role="alert">{{ saveError }}</p>

          <div class="edit-actions">
            <button class="modal-secondary" type="button" @click="closeCancelModal">Back</button>
            <button class="modal-danger" type="submit" :disabled="isSaving">
              {{ isSaving ? 'Cancelling...' : 'Confirm cancellation' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>

  <section v-else class="details-page">
    <section class="panel state-panel">
      <p class="section-label">Appointment</p>
      <h1>Appointment not found</h1>
      <RouterLink class="secondary-link" :to="{ name: 'appointments' }">
        Back to appointments
      </RouterLink>
    </section>
  </section>
</template>

<style scoped>
.details-page,
.record-column {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  padding: 1.25rem;
}

.hero-panel {
  display: grid;
  gap: 1rem;
}

.hero-copy {
  display: grid;
  gap: 0.35rem;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-copy h1,
.panel-head h2,
.state-panel h1,
.summary-card h2,
.edit-head h2 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1,
.state-panel h1 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.05;
}

.muted-copy,
.summary-row span,
.record-item span {
  color: #6b7280;
}

.hero-actions,
.panel-head,
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4a56c9;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.35rem 0.8rem;
}

.status-badge.completed {
  background: #ecfdf3;
  color: #15803d;
}

.status-badge.cancelled,
.status-badge.rejected {
  background: #fff1f2;
  color: #be123c;
}

.status-badge.pending {
  background: #fff7ed;
  color: #c2410c;
}

.secondary-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.details-grid {
  display: grid;
  gap: 1rem;
}

.summary-card {
  display: grid;
  gap: 0.8rem;
  align-content: start;
}

.summary-time {
  color: #111827;
  font-size: 1.45rem;
  font-weight: 700;
}

.summary-stack {
  display: grid;
  gap: 0;
  margin-top: 0.2rem;
}

.summary-row {
  display: grid;
  gap: 0.2rem;
  border-top: 1px solid #f1f5f9;
  padding: 0.9rem 0;
}

.summary-row:first-child {
  padding-top: 0;
  border-top: 0;
}

.summary-row:last-child {
  padding-bottom: 0;
}

.summary-row strong,
.record-item strong {
  color: #111827;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.record-grid {
  display: grid;
  gap: 1rem;
  margin-top: 0.9rem;
}

.record-item {
  display: grid;
  gap: 0.32rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.9rem;
}

.record-item:first-child {
  border-top: 0;
  padding-top: 0;
}

.single-grid {
  margin-top: 0.2rem;
}

.action-row {
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.danger-button,
.modal-secondary,
.modal-danger,
.modal-close {
  cursor: pointer;
}

.danger-button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fff1f2;
  color: #b91c1c;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.inline-error,
.save-error {
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 500;
}

.state-panel {
  display: grid;
  gap: 0.75rem;
}

.edit-modal-shell {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.38);
}

.edit-modal {
  width: min(100%, 640px);
  border: 1px solid #dbe2ea;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.16);
  padding: 1.25rem;
}

.edit-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.edit-form {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.form-field {
  display: grid;
  gap: 0.45rem;
}

.form-field span {
  color: #4b5563;
  font-size: 0.88rem;
  font-weight: 600;
}

.form-field textarea {
  width: 100%;
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #ffffff;
  color: #111827;
  font: inherit;
  padding: 0.8rem 0.9rem;
  resize: vertical;
}

.form-field textarea:focus {
  outline: none;
  border-color: #9db3ff;
  box-shadow: 0 0 0 3px rgba(91, 97, 255, 0.12);
}

.edit-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.modal-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6.75rem;
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #ffffff;
  color: #4b5563;
  font-size: 0.88rem;
  font-weight: 600;
}

.modal-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 10rem;
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid #b91c1c;
  border-radius: 12px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 600;
}

.modal-danger:disabled {
  opacity: 0.65;
  cursor: wait;
}

.modal-close {
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #ffffff;
  color: #6b7280;
  font-size: 1.2rem;
  line-height: 1;
}

@media (min-width: 760px) {
  .hero-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }
}

@media (min-width: 1040px) {
  .details-grid {
    grid-template-columns: minmax(320px, 0.7fr) minmax(0, 1fr);
  }

  .record-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .record-wide {
    grid-column: 1 / -1;
  }
}
</style>
