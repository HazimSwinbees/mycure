<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { logoutUser } from '../../services/authApi'
import {
  getCurrentPatientEmergencyContact,
  getCurrentPatientMedicalHistory,
  getCurrentPatientProfile,
  updateCurrentPatientProfile,
  upsertCurrentPatientEmergencyContact,
  upsertCurrentPatientMedicalHistory,
} from '../../services/patientApi'

const patient = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const isSaving = ref(false)
const router = useRouter()
const activeEditor = ref('')

const medicalHistoryState = reactive({
  allergies: '',
  currentConditions: '',
  currentMedication: '',
  pastSurgery: '',
  familyHistory: '',
  bloodType: '',
})

const emergencyContactState = reactive({
  contactName: '',
  relationship: '',
  phoneNumber: '',
  alternateNumber: '',
  address: '',
})

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

const formatDate = (value) => {
  if (!value) return 'Not provided'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(date)
    .replaceAll('/', '-')
}

const initials = computed(() => {
  const fullName = patient.value?.full_name || 'Patient'
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})

const profileSummary = computed(() => [
  { label: 'Patient ID', value: patient.value?.ic_passport_number || 'Not provided' },
  { label: 'Gender', value: patient.value?.gender || 'Not provided' },
  { label: 'Role', value: 'Patient' },
])

const personalInfo = computed(() => [
  { label: 'First name', value: patient.value?.first_name || 'Not provided' },
  { label: 'Last name', value: patient.value?.last_name || 'Not provided' },
  { label: 'Email address', value: patient.value?.email || 'Not provided' },
  { label: 'Phone number', value: patient.value?.phone || 'Not provided' },
  { label: 'Home address', value: patient.value?.home_address || 'Not provided' },
  { label: 'Date of birth', value: formatDate(patient.value?.date_of_birth) },
])

const medicalHistory = computed(() => [
  { label: 'Allergies', value: medicalHistoryState.allergies || '-' },
  { label: 'Current conditions', value: medicalHistoryState.currentConditions || '-' },
  { label: 'Current medication', value: medicalHistoryState.currentMedication || '-' },
  { label: 'Past surgery', value: medicalHistoryState.pastSurgery || '-' },
  { label: 'Family history', value: medicalHistoryState.familyHistory || '-' },
  { label: 'Blood type', value: medicalHistoryState.bloodType || '-' },
])

const emergencyContact = computed(() => [
  { label: 'Contact name', value: emergencyContactState.contactName || '-' },
  { label: 'Relationship', value: emergencyContactState.relationship || '-' },
  { label: 'Phone number', value: emergencyContactState.phoneNumber || '-' },
  { label: 'Alternate number', value: emergencyContactState.alternateNumber || '-' },
  { label: 'Address', value: emergencyContactState.address || '-' },
])

const handleLogout = async () => {
  await logoutUser()
  localStorage.removeItem('mycure_token')
  localStorage.removeItem('mycure_refresh_token')
  localStorage.removeItem('mycure_role')
  localStorage.removeItem('mycure_user')
  router.push({ name: 'login' })
}

const populatePersonalForm = () => {
  personalForm.firstName = patient.value?.first_name || ''
  personalForm.lastName = patient.value?.last_name || ''
  personalForm.email = patient.value?.email || ''
  personalForm.phone = patient.value?.phone || ''
  personalForm.homeAddress = patient.value?.home_address || ''
  personalForm.dateOfBirth = patient.value?.date_of_birth || ''
}

const populateMedicalForm = () => {
  medicalForm.allergies = medicalHistoryState.allergies
  medicalForm.currentConditions = medicalHistoryState.currentConditions
  medicalForm.currentMedication = medicalHistoryState.currentMedication
  medicalForm.pastSurgery = medicalHistoryState.pastSurgery
  medicalForm.familyHistory = medicalHistoryState.familyHistory
  medicalForm.bloodType = medicalHistoryState.bloodType
}

const populateEmergencyForm = () => {
  emergencyForm.contactName = emergencyContactState.contactName
  emergencyForm.relationship = emergencyContactState.relationship
  emergencyForm.phoneNumber = emergencyContactState.phoneNumber
  emergencyForm.alternateNumber = emergencyContactState.alternateNumber
  emergencyForm.address = emergencyContactState.address
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
  saveError.value = ''
  isSaving.value = true

  try {
  if (activeEditor.value === 'personal' && patient.value) {
      patient.value = await updateCurrentPatientProfile({
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        phone: personalForm.phone,
        homeAddress: personalForm.homeAddress,
        dateOfBirth: personalForm.dateOfBirth,
      })
  }

  if (activeEditor.value === 'medical') {
      const savedMedicalHistory = await upsertCurrentPatientMedicalHistory({
        allergies: medicalForm.allergies,
        currentConditions: medicalForm.currentConditions,
        currentMedication: medicalForm.currentMedication,
        pastSurgery: medicalForm.pastSurgery,
        familyHistory: medicalForm.familyHistory,
        bloodType: medicalForm.bloodType,
      })

      medicalHistoryState.allergies = savedMedicalHistory?.allergies || ''
      medicalHistoryState.currentConditions = savedMedicalHistory?.current_conditions || ''
      medicalHistoryState.currentMedication = savedMedicalHistory?.current_medication || ''
      medicalHistoryState.pastSurgery = savedMedicalHistory?.past_surgery || ''
      medicalHistoryState.familyHistory = savedMedicalHistory?.family_history || ''
      medicalHistoryState.bloodType = savedMedicalHistory?.blood_type || ''
  }

  if (activeEditor.value === 'emergency') {
      const savedEmergencyContact = await upsertCurrentPatientEmergencyContact({
        contactName: emergencyForm.contactName,
        relationship: emergencyForm.relationship,
        phoneNumber: emergencyForm.phoneNumber,
        alternateNumber: emergencyForm.alternateNumber,
        address: emergencyForm.address,
      })

      emergencyContactState.contactName = savedEmergencyContact?.contact_name || ''
      emergencyContactState.relationship = savedEmergencyContact?.relationship || ''
      emergencyContactState.phoneNumber = savedEmergencyContact?.phone_number || ''
      emergencyContactState.alternateNumber = savedEmergencyContact?.alternate_number || ''
      emergencyContactState.address = savedEmergencyContact?.address || ''
    }

    closeEditor()
  } catch (error) {
    saveError.value = error.message || 'Unable to save changes.'
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    patient.value = await getCurrentPatientProfile()
    const [medicalHistoryRecord, emergencyContactRecord] = await Promise.all([
      getCurrentPatientMedicalHistory(),
      getCurrentPatientEmergencyContact(),
    ])

    if (medicalHistoryRecord) {
      medicalHistoryState.allergies = medicalHistoryRecord.allergies || ''
      medicalHistoryState.currentConditions = medicalHistoryRecord.current_conditions || ''
      medicalHistoryState.currentMedication = medicalHistoryRecord.current_medication || ''
      medicalHistoryState.pastSurgery = medicalHistoryRecord.past_surgery || ''
      medicalHistoryState.familyHistory = medicalHistoryRecord.family_history || ''
      medicalHistoryState.bloodType = medicalHistoryRecord.blood_type || ''
    }

    if (emergencyContactRecord) {
      emergencyContactState.contactName = emergencyContactRecord.contact_name || ''
      emergencyContactState.relationship = emergencyContactRecord.relationship || ''
      emergencyContactState.phoneNumber = emergencyContactRecord.phone_number || ''
      emergencyContactState.alternateNumber = emergencyContactRecord.alternate_number || ''
      emergencyContactState.address = emergencyContactRecord.address || ''
    }
  } catch (error) {
    loadError.value = error.message || 'Unable to load patient information.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="profile-page">
    <p v-if="loadError" class="profile-message" role="alert">{{ loadError }}</p>
    <div v-else-if="isLoading" class="profile-message">Loading patient information...</div>

    <template v-else>
      <div class="profile-layout">
        <aside class="profile-summary">
          <section class="summary-card">
            <div class="profile-avatar" aria-hidden="true">
              <img v-if="patient?.photo_url" :src="patient.photo_url" alt="" />
              <span v-else>{{ initials }}</span>
            </div>

            <div class="identity-copy">
              <p class="section-label">Patient profile</p>
              <h1>{{ patient?.full_name || 'Patient' }}</h1>
              <p class="muted-copy">{{ patient?.email || 'Email not provided' }}</p>
            </div>

            <div class="summary-stack">
              <article v-for="item in profileSummary" :key="item.label" class="summary-row">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>

            <button class="summary-logout" type="button" @click="handleLogout">Log out</button>
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

.summary-logout {
  min-height: 2.8rem;
  margin-top: 0.25rem;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.95rem;
  font-weight: 600;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.summary-logout:hover {
  border-color: #fca5a5;
  background: #fee2e2;
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
.profile-message {
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
.record-item strong {
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
.modal-close,
.summary-logout {
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
  transition:
    background 160ms ease,
    border-color 160ms ease;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .record-item {
    border-top: 0;
    border-left: 1px solid #f1f5f9;
    padding-top: 0;
    padding-left: 1rem;
  }

  .record-item:nth-child(odd) {
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
  .record-item:nth-child(odd) {
    border-left: 1px solid #f1f5f9;
    padding-left: 1rem;
  }

  .record-item:nth-child(3n + 1) {
    border-left: 0;
    padding-left: 0;
  }
}
</style>
