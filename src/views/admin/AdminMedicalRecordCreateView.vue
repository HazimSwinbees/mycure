<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { createMedicalRecord, getMedicalRecordDraftByAppointmentId } from '../../services/medicalRecordApi'

const route = useRoute()
const router = useRouter()

const appointmentDraft = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const isSaving = ref(false)

const form = reactive({
  chiefComplaint: '',
  clinicalNote: '',
  diagnosis: '',
  followUp: '',
  includePrescription: false,
  medicineName: '',
  strength: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
})

const hasAppointmentContext = computed(() => Boolean(route.query.appointmentId))

const canSave = computed(() => {
  if (!appointmentDraft.value?.patientId || !appointmentDraft.value?.visitDate) {
    return false
  }

  if (!form.clinicalNote.trim() || !form.diagnosis.trim()) {
    return false
  }

  if (!form.includePrescription) {
    return true
  }

  return [
    form.medicineName,
    form.strength,
    form.dosage,
    form.frequency,
    form.duration,
    form.instructions,
  ].every((value) => value.trim())
})

const resetPrescriptionForm = () => {
  form.medicineName = ''
  form.strength = ''
  form.dosage = ''
  form.frequency = ''
  form.duration = ''
  form.instructions = ''
}

const clearForm = () => {
  form.chiefComplaint = appointmentDraft.value?.chiefComplaint || ''
  form.clinicalNote = ''
  form.diagnosis = ''
  form.followUp = ''
  form.includePrescription = false
  resetPrescriptionForm()
  saveError.value = ''
}

const loadDraft = async () => {
  isLoading.value = true
  loadError.value = ''

  if (!hasAppointmentContext.value) {
    isLoading.value = false
    loadError.value = 'Open this page from an appointment so the patient, service, and time can be filled automatically.'
    return
  }

  try {
    const draft = await getMedicalRecordDraftByAppointmentId(route.query.appointmentId)
    appointmentDraft.value = draft

    if (!draft) {
      loadError.value = 'The selected appointment could not be found.'
      return
    }

    form.chiefComplaint = draft.chiefComplaint || ''
  } catch (error) {
    loadError.value = error.message || 'Unable to prepare the visit record form.'
  } finally {
    isLoading.value = false
  }
}

const saveRecord = async () => {
  if (!appointmentDraft.value || !canSave.value) {
    return
  }

  isSaving.value = true
  saveError.value = ''

  try {
    const recordId = await createMedicalRecord({
      appointmentId: appointmentDraft.value.appointmentId,
      patientId: appointmentDraft.value.patientId,
      visitDate: appointmentDraft.value.visitDate,
      appointmentTime: appointmentDraft.value.appointmentTime,
      serviceName: appointmentDraft.value.serviceName,
      chiefComplaint: form.chiefComplaint.trim(),
      clinicalNote: form.clinicalNote.trim(),
      diagnosis: form.diagnosis.trim(),
      followUp: form.followUp.trim(),
      prescription: {
        enabled: form.includePrescription,
        medicineName: form.medicineName.trim(),
        strength: form.strength.trim(),
        dosage: form.dosage.trim(),
        frequency: form.frequency.trim(),
        duration: form.duration.trim(),
        instructions: form.instructions.trim(),
      },
    })

    await router.push({
      name: 'admin-medical-record-details',
      params: { id: recordId },
    })
  } catch (error) {
    saveError.value = error.message || 'Unable to save the visit record.'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadDraft)
</script>

<template>
  <section class="doctor-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Create record</p>
        <h1>New visit record</h1>
        <p class="muted-copy">Record the visit against the selected appointment and optionally issue a prescription.</p>
      </div>
      <RouterLink class="text-link" :to="{ name: 'admin-medical-records' }">Back to records</RouterLink>
    </section>

    <section v-if="isLoading" class="panel">
      <p class="section-label">Record draft</p>
      <h2>Loading appointment</h2>
    </section>

    <section v-else-if="loadError" class="panel">
      <p class="section-label">Record draft</p>
      <h2>Unable to prepare form</h2>
      <p class="muted-copy">{{ loadError }}</p>
      <RouterLink class="secondary-action link-button" :to="{ name: 'admin-appointments' }">
        Open appointments
      </RouterLink>
    </section>

    <template v-else-if="appointmentDraft">
      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Appointment context</p>
            <h2>Visit details</h2>
          </div>
        </div>

        <div class="form-grid compact-grid">
          <label class="field">
            <span>Patient</span>
            <input type="text" :value="appointmentDraft.patientName" readonly />
          </label>
          <label class="field">
            <span>Visit date</span>
            <input type="date" :value="appointmentDraft.visitDate" readonly />
          </label>
          <label class="field">
            <span>Time</span>
            <input type="text" :value="appointmentDraft.appointmentTime" readonly />
          </label>
          <label class="field">
            <span>Service selected</span>
            <input type="text" :value="appointmentDraft.serviceName" readonly />
          </label>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Clinical record</p>
            <h2>Consultation form</h2>
          </div>
        </div>

        <div class="form-grid">
          <label class="field field-wide">
            <span>Chief complaint</span>
            <textarea v-model="form.chiefComplaint" rows="3" placeholder="Describe the main complaint" />
          </label>

          <label class="field field-wide">
            <span>Clinical note</span>
            <textarea
              v-model="form.clinicalNote"
              rows="5"
              placeholder="Add consultation findings and observations"
            />
          </label>

          <label class="field">
            <span>Diagnosis</span>
            <input v-model="form.diagnosis" type="text" placeholder="Working diagnosis" />
          </label>

          <label class="field">
            <span>Follow-up</span>
            <input v-model="form.followUp" type="text" placeholder="Follow-up plan" />
          </label>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Prescription</p>
            <h2>Medication issue</h2>
          </div>
        </div>

        <label class="checkbox-row">
          <input v-model="form.includePrescription" type="checkbox" />
          <span>Create prescription for this visit</span>
        </label>

        <div v-if="form.includePrescription" class="form-grid prescription-grid">
          <label class="field">
            <span>Medicine name</span>
            <input v-model="form.medicineName" type="text" placeholder="Enter medicine name" />
          </label>
          <label class="field">
            <span>Strength</span>
            <input v-model="form.strength" type="text" placeholder="Example: 500 mg" />
          </label>
          <label class="field">
            <span>Dosage</span>
            <input v-model="form.dosage" type="text" placeholder="Example: 1 tablet" />
          </label>
          <label class="field">
            <span>Frequency</span>
            <input v-model="form.frequency" type="text" placeholder="Example: Twice daily" />
          </label>
          <label class="field">
            <span>Duration</span>
            <input v-model="form.duration" type="text" placeholder="Example: 7 days" />
          </label>
          <label class="field field-wide">
            <span>Instructions</span>
            <textarea
              v-model="form.instructions"
              rows="3"
              placeholder="Add instructions such as before food, after food, or caution notes"
            />
          </label>
        </div>

        <p v-if="saveError" class="save-error" role="alert">{{ saveError }}</p>

        <div class="action-row">
          <button class="primary-action" type="button" :disabled="isSaving || !canSave" @click="saveRecord">
            {{ isSaving ? 'Saving record...' : 'Save record' }}
          </button>
          <button class="secondary-action" type="button" :disabled="isSaving" @click="clearForm">
            Clear form
          </button>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.doctor-page,
.form-grid {
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
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hero-copy,
.field {
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
.panel-head h2 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.field span {
  color: #6b7280;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  color: #111827;
  padding: 0.8rem 0.9rem;
  font: inherit;
}

.field input[readonly] {
  background: #f9fafb;
  color: #4b5563;
}

.field textarea {
  resize: vertical;
}

.field-wide {
  grid-column: 1 / -1;
}

.compact-grid {
  gap: 0.85rem;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: #111827;
  font-weight: 500;
}

.checkbox-row input {
  width: 1rem;
  height: 1rem;
  accent-color: #4a56c9;
}

.prescription-grid {
  margin-top: 1rem;
}

.save-error {
  margin-top: 1rem;
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 500;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.primary-action,
.secondary-action,
.link-button {
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

.primary-action:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.secondary-action,
.link-button {
  border: 1px solid #d7e3fb;
  background: #f5f8ff;
  color: #3157b7;
}

.text-link {
  color: #4a56c9;
  font-weight: 600;
}

@media (min-width: 900px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .compact-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
