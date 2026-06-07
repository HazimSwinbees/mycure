<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getDoctorAppointmentById, updateDoctorAppointmentStatus } from '../../services/appointmentApi'
import { getDoctorMedicalRecordByAppointmentId } from '../../services/medicalRecordApi'

const route = useRoute()
const appointment = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const isSaving = ref(false)
const activeAction = ref('')
const medicalRecordId = ref('')

const reasonForm = reactive({
  reason: '',
})

const canConfirm = computed(() => appointment.value?.status === 'Pending')
const canReject = computed(() => appointment.value?.status === 'Pending')
const canCancel = computed(() => appointment.value?.status === 'Confirmed')
const canCreateRecord = computed(() => appointment.value?.status === 'Confirmed')
const canViewRecord = computed(() => appointment.value?.status === 'Completed' && Boolean(medicalRecordId.value))

const actionTitle = computed(() => {
  if (activeAction.value === 'reject') return 'Reject appointment'
  if (activeAction.value === 'cancel') return 'Cancel appointment'
  return ''
})

const actionButtonLabel = computed(() => {
  if (activeAction.value === 'reject') return isSaving.value ? 'Rejecting...' : 'Reject appointment'
  if (activeAction.value === 'cancel') return isSaving.value ? 'Cancelling...' : 'Cancel appointment'
  return 'Save'
})

const loadAppointment = async () => {
  isLoading.value = true
  loadError.value = ''
  medicalRecordId.value = ''

  try {
    appointment.value = await getDoctorAppointmentById(route.params.id)
    if (appointment.value?.id) {
      medicalRecordId.value = (await getDoctorMedicalRecordByAppointmentId(appointment.value.id)) || ''
    }
  } catch (error) {
    loadError.value = error.message || 'Unable to load appointment details.'
  } finally {
    isLoading.value = false
  }
}

const openReasonModal = (action) => {
  reasonForm.reason = ''
  saveError.value = ''
  activeAction.value = action
}

const closeReasonModal = () => {
  if (isSaving.value) return
  activeAction.value = ''
  reasonForm.reason = ''
  saveError.value = ''
}

const confirmAppointment = async () => {
  if (!appointment.value?.id) return

  isSaving.value = true
  saveError.value = ''

  try {
    appointment.value = await updateDoctorAppointmentStatus(appointment.value.id, {
      status: 'Confirmed',
      statusReason: '',
    })
  } catch (error) {
    saveError.value = error.message || 'Unable to confirm the appointment.'
  } finally {
    isSaving.value = false
  }
}

const submitReasonAction = async () => {
  if (!appointment.value?.id) return

  const trimmedReason = reasonForm.reason.trim()
  if (!trimmedReason) {
    saveError.value = 'Reason is required.'
    return
  }

  isSaving.value = true
  saveError.value = ''

  try {
    appointment.value = await updateDoctorAppointmentStatus(appointment.value.id, {
      status: activeAction.value === 'reject' ? 'Rejected' : 'Cancelled',
      statusReason: trimmedReason,
    })
    closeReasonModal()
  } catch (error) {
    saveError.value = error.message || 'Unable to update the appointment.'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadAppointment)
</script>

<template>
  <section class="doctor-page">
    <section v-if="isLoading" class="panel">
      <p class="section-label">Appointment details</p>
      <h2>Loading appointment</h2>
    </section>

    <section v-else-if="loadError" class="panel">
      <p class="section-label">Appointment details</p>
      <h2>Unable to load appointment</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <template v-else-if="appointment">
      <section class="hero-panel">
        <div class="hero-copy">
          <p class="section-label">Appointment details</p>
          <h1>{{ appointment.patientName }}</h1>
          <p class="muted-copy">{{ appointment.service }} · {{ appointment.date }} · {{ appointment.time }}</p>
        </div>
        <div class="hero-actions">
          <span :class="['status-badge', appointment.status.toLowerCase()]">{{ appointment.status }}</span>
          <RouterLink class="text-link" :to="{ name: 'admin-appointments' }">Back to appointments</RouterLink>
        </div>
      </section>

      <div class="content-grid">
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Visit</p>
              <h2>Consultation summary</h2>
            </div>
          </div>

          <div class="detail-grid">
            <article class="detail-item"><span>Reason for visit</span><strong>{{ appointment.notes || '-' }}</strong></article>
            <article class="detail-item"><span>Service category</span><strong>{{ appointment.category }}</strong></article>
            <article class="detail-item"><span>Doctor</span><strong>{{ appointment.doctor }}</strong></article>
            <article class="detail-item"><span>Location</span><strong>{{ appointment.location }}</strong></article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Patient</p>
              <h2>Record snapshot</h2>
            </div>
          </div>

          <div class="detail-grid">
            <article class="detail-item"><span>Age / Gender</span><strong>{{ appointment.patientAge ?? '-' }} · {{ appointment.patientGender || '-' }}</strong></article>
            <article class="detail-item"><span>Phone</span><strong>{{ appointment.patientPhone || '-' }}</strong></article>
            <article class="detail-item"><span>Email</span><strong>{{ appointment.patientEmail || '-' }}</strong></article>
          </div>
          <div class="panel-link-row">
            <RouterLink
              class="secondary-action link-button"
              :to="{ name: 'admin-patient-profile', params: { id: appointment.patientId } }"
            >
              View patient profile
            </RouterLink>
          </div>
        </section>
      </div>

      <section v-if="appointment.statusReason" class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Status note</p>
            <h2>Reason provided</h2>
          </div>
        </div>
        <p class="status-reason">{{ appointment.statusReason }}</p>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Actions</p>
            <h2>Doctor workflow</h2>
          </div>
        </div>

        <p v-if="saveError && !activeAction" class="inline-error" role="alert">{{ saveError }}</p>

        <div class="action-row">
          <button
            v-if="canConfirm"
            class="primary-action"
            type="button"
            :disabled="isSaving"
            @click="confirmAppointment"
          >
            {{ isSaving ? 'Confirming...' : 'Confirm appointment' }}
          </button>
          <button
            v-if="canReject"
            class="danger-action"
            type="button"
            :disabled="isSaving"
            @click="openReasonModal('reject')"
          >
            Reject appointment
          </button>
          <button
            v-if="canCancel"
            class="danger-outline"
            type="button"
            :disabled="isSaving"
            @click="openReasonModal('cancel')"
          >
            Cancel appointment
          </button>
          <RouterLink
            v-if="canCreateRecord"
            class="secondary-action link-button"
            :to="{ name: 'admin-medical-record-create', query: { appointmentId: appointment.id, patientId: appointment.patientId } }"
          >
            Create visit record
          </RouterLink>
          <RouterLink
            v-if="canViewRecord"
            class="secondary-action link-button"
            :to="{ name: 'admin-medical-record-details', params: { id: medicalRecordId } }"
          >
            View visit record
          </RouterLink>
        </div>
      </section>

      <div
        v-if="activeAction"
        class="edit-modal-shell"
        role="dialog"
        aria-modal="true"
        @click.self="closeReasonModal"
      >
        <section class="edit-modal">
          <div class="edit-head">
            <div>
              <p class="section-label">Action required</p>
              <h2>{{ actionTitle }}</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Close" @click="closeReasonModal">×</button>
          </div>

          <form class="edit-form" @submit.prevent="submitReasonAction">
            <label class="form-field">
              <span>Reason</span>
              <textarea
                v-model="reasonForm.reason"
                rows="4"
                placeholder="Provide a reason for this decision"
              />
            </label>

            <p v-if="saveError" class="save-error" role="alert">{{ saveError }}</p>

            <div class="edit-actions">
              <button class="modal-secondary" type="button" @click="closeReasonModal">Cancel</button>
              <button class="modal-danger" type="submit" :disabled="isSaving">
                {{ actionButtonLabel }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </template>

    <section v-else class="panel">
      <p class="section-label">Appointment</p>
      <h2>Record not found</h2>
    </section>
  </section>
</template>

<style scoped>
.doctor-page,
.content-grid {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  padding: 1.25rem;
}

.hero-panel,
.panel-head,
.hero-actions,
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.edit-head h2 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.detail-item span,
.status-reason {
  color: #6b7280;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4a56c9;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
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

.text-link {
  color: #4a56c9;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  gap: 0.85rem;
}

.detail-item {
  display: grid;
  gap: 0.28rem;
  border-top: 1px solid #eef2f7;
  padding-top: 0.85rem;
}

.detail-item strong {
  color: #111827;
  font-weight: 600;
}

.action-row {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.panel-link-row {
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
}

.primary-action,
.secondary-action,
.link-button,
.danger-action,
.danger-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 1rem;
}

.primary-action {
  border: 1px solid #4a56c9;
  background: #4a56c9;
  color: #fff;
}

.secondary-action,
.link-button {
  border: 1px solid #d7e3fb;
  background: #f5f8ff;
  color: #3157b7;
}

.danger-action {
  border: 1px solid #ef4444;
  background: #ef4444;
  color: #fff;
}

.danger-outline {
  border: 1px solid #fecaca;
  background: #fff5f5;
  color: #b91c1c;
}

.inline-error,
.save-error {
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-reason {
  margin-top: 0.25rem;
  line-height: 1.6;
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

.modal-secondary,
.modal-danger,
.modal-close {
  cursor: pointer;
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
  min-width: 9.5rem;
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

@media (min-width: 900px) {
  .content-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
