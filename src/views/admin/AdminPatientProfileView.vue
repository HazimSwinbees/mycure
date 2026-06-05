<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  getDoctorPatientById,
  updateDoctorPatientProfile,
  upsertDoctorPatientEmergencyContact,
  upsertDoctorPatientMedicalHistory,
} from '../../services/patientApi'

const route = useRoute()
const patient = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const isSaving = ref(false)
const activeEditor = ref('')

const personalForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  homeAddress: '',
  dateOfBirth: '',
})

const medicalForm = reactive({
  allergies: '',
  currentConditions: '',
  currentMedication: '',
  pastSurgery: '',
  familyHistory: '',
  bloodType: '',
})

const emergencyForm = reactive({
  contactName: '',
  relationship: '',
  phoneNumber: '',
  alternateNumber: '',
  address: '',
})

const initials = computed(() => {
  const fullName = patient.value?.name || 'Patient'
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})

const profileSummary = computed(() => [
  { label: 'Patient ID', value: patient.value?.id || '-' },
  { label: 'Gender', value: patient.value?.gender || '-' },
  { label: 'Role', value: 'Patient' },
])

const personalInfo = computed(() => [
  { label: 'First name', value: patient.value?.firstName || '-' },
  { label: 'Last name', value: patient.value?.lastName || '-' },
  { label: 'Email address', value: patient.value?.email || '-' },
  { label: 'Phone number', value: patient.value?.phone || '-' },
  { label: 'Home address', value: patient.value?.homeAddress || '-' },
  { label: 'Date of birth', value: patient.value?.dateOfBirth || '-' },
])

const medicalHistory = computed(() => [
  { label: 'Allergies', value: patient.value?.allergies || '-' },
  { label: 'Current conditions', value: patient.value?.currentConditions || '-' },
  { label: 'Current medication', value: patient.value?.medication || '-' },
  { label: 'Past surgery', value: patient.value?.pastSurgery || '-' },
  { label: 'Family history', value: patient.value?.familyHistory || '-' },
  { label: 'Blood type', value: patient.value?.bloodType || '-' },
])

const emergencyContact = computed(() => [
  { label: 'Contact name', value: patient.value?.emergencyContact || '-' },
  { label: 'Relationship', value: patient.value?.emergencyRelationship || '-' },
  { label: 'Phone number', value: patient.value?.emergencyPhoneNumber || '-' },
  { label: 'Alternate number', value: patient.value?.emergencyAlternateNumber || '-' },
  { label: 'Address', value: patient.value?.emergencyAddress || '-' },
])

const loadPatient = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    patient.value = await getDoctorPatientById(route.params.id)
  } catch (error) {
    loadError.value = error.message || 'Unable to load patient details.'
  } finally {
    isLoading.value = false
  }
}

const populatePersonalForm = () => {
  personalForm.firstName = patient.value?.firstName && patient.value.firstName !== '-' ? patient.value.firstName : ''
  personalForm.lastName = patient.value?.lastName && patient.value.lastName !== '-' ? patient.value.lastName : ''
  personalForm.email = patient.value?.email && patient.value.email !== '-' ? patient.value.email : ''
  personalForm.phone = patient.value?.phone && patient.value.phone !== '-' ? patient.value.phone : ''
  personalForm.homeAddress =
    patient.value?.homeAddress && patient.value.homeAddress !== '-' ? patient.value.homeAddress : ''
  personalForm.dateOfBirth =
    patient.value?.rawDateOfBirth && patient.value.rawDateOfBirth !== '-' ? patient.value.rawDateOfBirth : ''
}

const populateMedicalForm = () => {
  medicalForm.allergies = patient.value?.allergies && patient.value.allergies !== '-' ? patient.value.allergies : ''
  medicalForm.currentConditions =
    patient.value?.currentConditions && patient.value.currentConditions !== '-'
      ? patient.value.currentConditions
      : ''
  medicalForm.currentMedication =
    patient.value?.medication && patient.value.medication !== '-' ? patient.value.medication : ''
  medicalForm.pastSurgery =
    patient.value?.pastSurgery && patient.value.pastSurgery !== '-' ? patient.value.pastSurgery : ''
  medicalForm.familyHistory =
    patient.value?.familyHistory && patient.value.familyHistory !== '-' ? patient.value.familyHistory : ''
  medicalForm.bloodType = patient.value?.bloodType && patient.value.bloodType !== '-' ? patient.value.bloodType : ''
}

const populateEmergencyForm = () => {
  emergencyForm.contactName =
    patient.value?.emergencyContact && patient.value.emergencyContact !== '-' ? patient.value.emergencyContact : ''
  emergencyForm.relationship =
    patient.value?.emergencyRelationship && patient.value.emergencyRelationship !== '-'
      ? patient.value.emergencyRelationship
      : ''
  emergencyForm.phoneNumber =
    patient.value?.emergencyPhoneNumber && patient.value.emergencyPhoneNumber !== '-'
      ? patient.value.emergencyPhoneNumber
      : ''
  emergencyForm.alternateNumber =
    patient.value?.emergencyAlternateNumber && patient.value.emergencyAlternateNumber !== '-'
      ? patient.value.emergencyAlternateNumber
      : ''
  emergencyForm.address =
    patient.value?.emergencyAddress && patient.value.emergencyAddress !== '-' ? patient.value.emergencyAddress : ''
}

const openEditor = (section) => {
  if (section === 'personal') populatePersonalForm()
  if (section === 'medical') populateMedicalForm()
  if (section === 'emergency') populateEmergencyForm()
  activeEditor.value = section
}

const closeEditor = () => {
  activeEditor.value = ''
  saveError.value = ''
}

const saveEditor = async () => {
  if (!patient.value?.id) return

  saveError.value = ''
  isSaving.value = true

  try {
    if (activeEditor.value === 'personal') {
      patient.value = await updateDoctorPatientProfile(patient.value.id, {
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        phone: personalForm.phone,
        homeAddress: personalForm.homeAddress,
        dateOfBirth: personalForm.dateOfBirth,
      })
    }

    if (activeEditor.value === 'medical') {
      patient.value = await upsertDoctorPatientMedicalHistory(patient.value.id, {
        allergies: medicalForm.allergies,
        currentConditions: medicalForm.currentConditions,
        currentMedication: medicalForm.currentMedication,
        pastSurgery: medicalForm.pastSurgery,
        familyHistory: medicalForm.familyHistory,
        bloodType: medicalForm.bloodType,
      })
    }

    if (activeEditor.value === 'emergency') {
      patient.value = await upsertDoctorPatientEmergencyContact(patient.value.id, {
        contactName: emergencyForm.contactName,
        relationship: emergencyForm.relationship,
        phoneNumber: emergencyForm.phoneNumber,
        alternateNumber: emergencyForm.alternateNumber,
        address: emergencyForm.address,
      })
    }

    closeEditor()
  } catch (error) {
    saveError.value = error.message || 'Unable to save changes.'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadPatient)
</script>

<template>
  <section class="profile-page">
    <p v-if="loadError" class="profile-message" role="alert">{{ loadError }}</p>
    <div v-else-if="isLoading" class="profile-message">Loading patient information...</div>

    <template v-else-if="patient">
      <div class="profile-layout">
        <aside class="profile-summary">
          <section class="summary-card">
            <div class="profile-avatar" aria-hidden="true">
              <img v-if="patient.photoUrl" :src="patient.photoUrl" alt="" />
              <span v-else>{{ initials }}</span>
            </div>

            <div class="identity-copy">
              <p class="section-label">Patient profile</p>
              <h1>{{ patient.name }}</h1>
              <p class="muted-copy">{{ patient.email || 'Email not provided' }}</p>
            </div>

            <div class="summary-stack">
              <article v-for="item in profileSummary" :key="item.label" class="summary-row">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>

            <RouterLink class="summary-link" :to="{ name: 'admin-patients' }">Back to patients</RouterLink>
          </section>
        </aside>

        <div class="record-column">
          <section class="record-panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Personal information</p>
                <h2>Core details</h2>
              </div>
              <button class="panel-edit" type="button" @click="openEditor('personal')">Edit</button>
            </div>

            <div class="record-grid">
              <article v-for="item in personalInfo" :key="item.label" class="record-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>
          </section>

          <section class="record-panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Medical history</p>
                <h2>Health record</h2>
              </div>
              <button class="panel-edit" type="button" @click="openEditor('medical')">Edit</button>
            </div>

            <div class="record-grid">
              <article v-for="item in medicalHistory" :key="item.label" class="record-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>
          </section>

          <section class="record-panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Emergency contact</p>
                <h2>Primary contact</h2>
              </div>
              <button class="panel-edit" type="button" @click="openEditor('emergency')">Edit</button>
            </div>

            <div class="record-grid">
              <article v-for="item in emergencyContact" :key="item.label" class="record-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>
          </section>

          <section class="record-panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Appointments</p>
                <h2>Recent visits</h2>
              </div>
            </div>

            <div class="appointment-list appointment-scroll">
              <RouterLink
                v-for="item in patient.recentAppointments"
                :key="item.id"
                class="appointment-row"
                :to="{ name: 'admin-appointment-details', params: { id: item.id } }"
              >
                <div class="appointment-main">
                  <strong>{{ item.service }}</strong>
                  <span>{{ item.reason }}</span>
                </div>
                <div class="appointment-side">
                  <div class="appointment-meta">
                    <small>Date</small>
                    <strong>{{ item.date }}</strong>
                  </div>
                  <div class="appointment-meta">
                    <small>Time</small>
                    <strong>{{ item.time }}</strong>
                  </div>
                  <span :class="['appointment-status', `status-${item.status.toLowerCase()}`]">
                    {{ item.status }}
                  </span>
                </div>
              </RouterLink>

              <article v-if="!patient.recentAppointments.length" class="appointment-row empty-row">
                <div class="appointment-main">
                  <strong>No appointments</strong>
                  <span>No appointment history is available.</span>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>

      <div
        v-if="activeEditor"
        class="edit-modal-shell"
        role="dialog"
        aria-modal="true"
        @click.self="closeEditor"
      >
        <section class="edit-modal">
          <div class="edit-head">
            <div>
              <p class="section-label">Edit details</p>
              <h2 v-if="activeEditor === 'personal'">Personal information</h2>
              <h2 v-else-if="activeEditor === 'medical'">Medical history</h2>
              <h2 v-else>Emergency contact</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Close edit form" @click="closeEditor">
              ×
            </button>
          </div>

          <form class="edit-form" @submit.prevent="saveEditor">
            <template v-if="activeEditor === 'personal'">
              <label class="form-field">
                <span>First name</span>
                <input v-model="personalForm.firstName" type="text" />
              </label>
              <label class="form-field">
                <span>Last name</span>
                <input v-model="personalForm.lastName" type="text" />
              </label>
              <label class="form-field form-field-wide">
                <span>Email address</span>
                <input v-model="personalForm.email" type="email" readonly />
              </label>
              <label class="form-field">
                <span>Phone number</span>
                <input v-model="personalForm.phone" type="text" />
              </label>
              <label class="form-field">
                <span>Date of birth</span>
                <input v-model="personalForm.dateOfBirth" type="date" />
              </label>
              <label class="form-field form-field-wide">
                <span>Home address</span>
                <textarea v-model="personalForm.homeAddress" rows="3" />
              </label>
            </template>

            <template v-else-if="activeEditor === 'medical'">
              <label class="form-field form-field-wide">
                <span>Allergies</span>
                <textarea v-model="medicalForm.allergies" rows="2" />
              </label>
              <label class="form-field form-field-wide">
                <span>Current conditions</span>
                <textarea v-model="medicalForm.currentConditions" rows="2" />
              </label>
              <label class="form-field form-field-wide">
                <span>Current medication</span>
                <textarea v-model="medicalForm.currentMedication" rows="2" />
              </label>
              <label class="form-field form-field-wide">
                <span>Past surgery</span>
                <input v-model="medicalForm.pastSurgery" type="text" />
              </label>
              <label class="form-field">
                <span>Family history</span>
                <input v-model="medicalForm.familyHistory" type="text" />
              </label>
              <label class="form-field">
                <span>Blood type</span>
                <input v-model="medicalForm.bloodType" type="text" />
              </label>
            </template>

            <template v-else>
              <label class="form-field">
                <span>Contact name</span>
                <input v-model="emergencyForm.contactName" type="text" />
              </label>
              <label class="form-field">
                <span>Relationship</span>
                <input v-model="emergencyForm.relationship" type="text" />
              </label>
              <label class="form-field">
                <span>Phone number</span>
                <input v-model="emergencyForm.phoneNumber" type="text" />
              </label>
              <label class="form-field">
                <span>Alternate number</span>
                <input v-model="emergencyForm.alternateNumber" type="text" />
              </label>
              <label class="form-field form-field-wide">
                <span>Address</span>
                <textarea v-model="emergencyForm.address" rows="3" />
              </label>
            </template>

            <p v-if="saveError" class="save-error" role="alert">{{ saveError }}</p>

            <div class="edit-actions">
              <button class="modal-secondary" type="button" @click="closeEditor">Cancel</button>
              <button class="modal-primary" type="submit" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : 'Save changes' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </template>

    <div v-else class="profile-message">Patient record not found.</div>
  </section>
</template>

<style scoped>
.profile-page,
.identity-copy,
.summary-stack,
.record-column {
  display: grid;
  gap: 1rem;
}

.profile-message,
.summary-card,
.record-panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.profile-message,
.summary-card,
.record-panel {
  padding: 1.25rem;
}

.profile-layout {
  display: grid;
  gap: 1rem;
}

.profile-summary {
  display: grid;
  align-content: start;
}

.summary-card {
  display: grid;
  gap: 1.25rem;
}

.summary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.8rem;
  margin-top: 0.25rem;
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #ffffff;
  color: #4b5563;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.summary-link:hover {
  border-color: #c5cfdb;
  background: #f8fafc;
  transform: translateY(-1px);
}

.profile-avatar {
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  background: #f3f4f6;
  color: #374151;
  font-size: 1.35rem;
  font-weight: 700;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.identity-copy {
  gap: 0.3rem;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.identity-copy h1,
.panel-head h2 {
  color: #111827;
  font-weight: 700;
}

.identity-copy h1 {
  font-size: clamp(1.8rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.summary-row span,
.record-item span,
.profile-message,
.appointment-main span,
.appointment-meta small {
  color: #6b7280;
}

.summary-stack {
  gap: 0;
}

.summary-row {
  display: grid;
  gap: 0.2rem;
  border-top: 1px solid #f1f5f9;
  padding: 0.9rem 0;
}

.summary-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.summary-row:last-child {
  padding-bottom: 0;
}

.summary-row strong,
.record-item strong,
.appointment-main strong,
.appointment-status,
.appointment-meta strong {
  color: #111827;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.panel-edit,
.modal-secondary,
.modal-primary,
.modal-close {
  cursor: pointer;
}

.panel-edit,
.modal-secondary {
  min-height: 2.2rem;
  padding: 0 0.9rem;
  border: 1px solid #dbe2ea;
  border-radius: 999px;
  background: #ffffff;
  color: #4b5563;
  font-size: 0.88rem;
  font-weight: 600;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    color 160ms ease;
}

.panel-edit:hover,
.modal-secondary:hover {
  border-color: #c5cfdb;
  background: #f8fafc;
  color: #111827;
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

.appointment-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.9rem;
}

.appointment-scroll {
  max-height: 320px;
  overflow-y: auto;
  padding-right: 0.35rem;
}

.appointment-row {
  display: grid;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  color: inherit;
  background: #ffffff;
  text-decoration: none;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
}

.appointment-row:hover {
  background: #f8faff;
  border-color: #d7e3fb;
  box-shadow: 0 10px 20px rgba(74, 86, 201, 0.08);
  opacity: 1;
  transform: translateY(-1px);
}

.appointment-main,
.appointment-meta {
  display: grid;
  gap: 0.25rem;
}

.appointment-side {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #eef2f7;
  padding-top: 0.85rem;
}

.appointment-meta {
  min-width: 96px;
  justify-items: start;
}

.appointment-status {
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

.appointment-status.status-completed {
  background: #ecfdf3;
  color: #15803d;
}

.appointment-status.status-cancelled {
  background: #fff1f2;
  color: #be123c;
}

.appointment-status.status-pending {
  background: #fff7ed;
  color: #c2410c;
}

.empty-row {
  justify-content: flex-start;
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
  width: min(100%, 760px);
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

.form-field input,
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

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #9db3ff;
  box-shadow: 0 0 0 3px rgba(91, 97, 255, 0.12);
}

.form-field input[readonly] {
  background: #f8fafc;
  color: #6b7280;
  cursor: default;
}

.edit-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
  grid-column: 1 / -1;
  width: 100%;
}

.save-error {
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 8.75rem;
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid #4a56c9;
  border-radius: 12px;
  background: #4a56c9;
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.modal-primary:hover {
  border-color: #3f4fb3;
  background: #3f4fb3;
}

.modal-primary:disabled {
  border-color: #c7d2fe;
  background: #c7d2fe;
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

.modal-close:hover {
  background: #f8fafc;
  color: #111827;
}

.modal-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6.75rem;
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  line-height: 1;
  white-space: nowrap;
}

@media (min-width: 760px) {
  .record-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .record-item {
    border-top: 0;
    border-left: 1px solid #f1f5f9;
    padding-top: 0;
    padding-left: 1rem;
  }

  .record-item:nth-child(3n + 1) {
    border-left: 0;
    padding-left: 0;
  }

  .edit-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-field-wide {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1100px) {
  .profile-layout {
    grid-template-columns: 320px minmax(0, 1fr);
    align-items: start;
  }

  .profile-summary {
    position: sticky;
    top: 1.5rem;
  }

  .record-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .record-item,
  .record-item:nth-child(3n + 1) {
    border-left: 1px solid #f1f5f9;
    padding-left: 1rem;
  }

  .record-item:nth-child(3n + 1) {
    border-left: 0;
    padding-left: 0;
  }
}

@media (min-width: 1100px) {
  .record-column {
    gap: 1.25rem;
  }

  .summary-card,
  .record-panel {
    padding: 1.5rem;
  }

  .record-item,
  .record-item:nth-child(3n + 1) {
    border-left: 1px solid #f1f5f9;
    padding-left: 1rem;
  }

  .record-item:nth-child(3n + 1) {
    border-left: 0;
    padding-left: 0;
  }
}

@media (max-width: 700px) {
  .appointment-side {
    flex-direction: column;
    align-items: flex-start;
  }

  .appointment-meta {
    justify-items: start;
  }
}
</style>
