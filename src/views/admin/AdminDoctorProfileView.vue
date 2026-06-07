<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  getCurrentDoctorProfile,
  updateCurrentDoctorProfile,
} from '../../services/doctorProfileApi'

const doctor = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const isSaving = ref(false)
const activeEditor = ref('')

const profileForm = reactive({
  fullName: '',
  roleTitle: '',
  qualification: '',
  experience: '',
  languages: '',
  specializations: '',
  workingHours: '',
  about: '',
})
const photoFile = ref(null)
const photoPreview = ref('')
let photoPreviewObjectUrl = ''

const initials = computed(() => {
  const fullName = doctor.value?.fullName || 'Doctor'
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})

const profileSummary = computed(() => [
  { label: 'Qualification', value: doctor.value?.qualification || '-' },
  { label: 'Experience', value: doctor.value?.experience || '-' },
  { label: 'Languages', value: doctor.value?.languages?.join(', ') || '-' },
])

const professionalInfo = computed(() => [
  { label: 'Qualification', value: doctor.value?.qualification || '-' },
  { label: 'Experience', value: doctor.value?.experience || '-' },
  { label: 'Languages', value: doctor.value?.languages?.join(', ') || '-' },
])

const loadDoctorProfile = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    doctor.value = await getCurrentDoctorProfile()
  } catch (error) {
    loadError.value = error.message || 'Unable to load doctor profile.'
  } finally {
    isLoading.value = false
  }
}

const openEditor = () => {
  if (photoPreviewObjectUrl) {
    URL.revokeObjectURL(photoPreviewObjectUrl)
    photoPreviewObjectUrl = ''
  }

  profileForm.fullName = doctor.value?.fullName || ''
  profileForm.roleTitle = doctor.value?.roleTitle || ''
  profileForm.qualification = doctor.value?.qualification || ''
  profileForm.experience = doctor.value?.experience || ''
  profileForm.languages = doctor.value?.languages?.join(', ') || ''
  profileForm.specializations = doctor.value?.specializations?.join('\n') || ''
  profileForm.workingHours = doctor.value?.workingHours?.join('\n') || ''
  profileForm.about = doctor.value?.about || ''
  photoFile.value = null
  photoPreview.value = doctor.value?.photoUrl || ''
  saveError.value = ''
  activeEditor.value = 'profile'
}

const closeEditor = () => {
  if (isSaving.value) return

  if (photoPreviewObjectUrl) {
    URL.revokeObjectURL(photoPreviewObjectUrl)
    photoPreviewObjectUrl = ''
  }

  activeEditor.value = ''
  saveError.value = ''
}

const saveProfile = async () => {
  saveError.value = ''
  isSaving.value = true

  try {
    doctor.value = await updateCurrentDoctorProfile({
      fullName: profileForm.fullName,
      roleTitle: profileForm.roleTitle,
      qualification: profileForm.qualification,
      experience: profileForm.experience,
      languages: profileForm.languages,
      specializations: profileForm.specializations,
      workingHours: profileForm.workingHours,
      about: profileForm.about,
      photoUrl: doctor.value?.photoUrl || '',
      photoFile: photoFile.value,
    })
    if (photoPreviewObjectUrl) {
      URL.revokeObjectURL(photoPreviewObjectUrl)
      photoPreviewObjectUrl = ''
    }
    photoFile.value = null
    photoPreview.value = doctor.value?.photoUrl || ''
    closeEditor()
  } catch (error) {
    saveError.value = error.message || 'Unable to save doctor profile.'
  } finally {
    isSaving.value = false
  }
}

const handlePhotoChange = (event) => {
  const [file] = event.target.files || []

  photoFile.value = file || null

  if (photoPreviewObjectUrl) {
    URL.revokeObjectURL(photoPreviewObjectUrl)
    photoPreviewObjectUrl = ''
  }

  if (!file) {
    photoPreview.value = doctor.value?.photoUrl || ''
    return
  }

  photoPreviewObjectUrl = URL.createObjectURL(file)
  photoPreview.value = photoPreviewObjectUrl
}

onMounted(loadDoctorProfile)

onBeforeUnmount(() => {
  if (photoPreviewObjectUrl) {
    URL.revokeObjectURL(photoPreviewObjectUrl)
    photoPreviewObjectUrl = ''
  }
})
</script>

<template>
  <section class="profile-page">
    <p v-if="loadError" class="profile-message" role="alert">{{ loadError }}</p>
    <div v-else-if="isLoading" class="profile-message">Loading doctor information...</div>

    <template v-else-if="doctor">
      <div class="profile-layout">
        <aside class="profile-summary">
          <section class="summary-card">
            <div class="profile-avatar" aria-hidden="true">
              <img v-if="doctor.photoUrl" :src="doctor.photoUrl" alt="" />
              <span v-else>{{ initials }}</span>
            </div>

            <div class="identity-copy">
              <p class="section-label">Doctor profile</p>
              <h1>{{ doctor.fullName }}</h1>
              <p class="muted-copy">{{ doctor.roleTitle }}</p>
            </div>

            <div class="summary-stack">
              <article v-for="item in profileSummary" :key="item.label" class="summary-row">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>
          </section>
        </aside>

        <div class="record-column">
          <section class="record-panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Professional details</p>
                <h2>Core information</h2>
              </div>
              <button class="panel-edit" type="button" @click="openEditor">Edit</button>
            </div>

            <div class="record-grid">
              <article v-for="item in professionalInfo" :key="item.label" class="record-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>
          </section>

          <section class="record-panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Specializations</p>
                <h2>Care focus</h2>
              </div>
            </div>

            <div class="list-block">
              <article
                v-for="specialization in doctor.specializations"
                :key="specialization"
                class="list-item"
              >
                <strong>{{ specialization }}</strong>
              </article>
            </div>
          </section>

          <section class="record-panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Working hours</p>
                <h2>Availability</h2>
              </div>
            </div>

            <div class="list-block">
              <article v-for="schedule in doctor.workingHours" :key="schedule" class="list-item">
                <strong>{{ schedule }}</strong>
              </article>
            </div>
          </section>

          <section class="record-panel">
            <div class="panel-head">
              <div>
                <p class="section-label">About</p>
                <h2>Profile summary</h2>
              </div>
            </div>

            <article class="record-item about-item">
              <strong>{{ doctor.about }}</strong>
            </article>
          </section>
        </div>
      </div>

      <div
        v-if="activeEditor === 'profile'"
        class="edit-modal-shell"
        role="dialog"
        aria-modal="true"
        @click.self="closeEditor"
      >
        <section class="edit-modal">
          <div class="edit-head">
            <div>
              <p class="section-label">Edit details</p>
              <h2>Doctor profile</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Close edit form" @click="closeEditor">
              x
            </button>
          </div>

          <form class="edit-form" @submit.prevent="saveProfile">
            <label class="form-field">
              <span>Full name</span>
              <input v-model="profileForm.fullName" type="text" />
            </label>

            <label class="form-field">
              <span>Role</span>
              <input v-model="profileForm.roleTitle" type="text" />
            </label>

            <label class="form-field form-field-wide">
              <span>Profile picture</span>
              <input type="file" accept="image/*" @change="handlePhotoChange" />
            </label>

            <div class="photo-preview form-field-wide">
              <span>Preview</span>
              <div class="photo-preview-box">
                <img v-if="photoPreview" :src="photoPreview" alt="" />
                <span v-else>{{ initials }}</span>
              </div>
            </div>

            <label class="form-field form-field-wide">
              <span>Qualification</span>
              <input v-model="profileForm.qualification" type="text" />
            </label>

            <label class="form-field">
              <span>Experience</span>
              <input v-model="profileForm.experience" type="text" />
            </label>

            <label class="form-field">
              <span>Languages</span>
              <input
                v-model="profileForm.languages"
                type="text"
                placeholder="English, Malay, Mandarin"
              />
            </label>

            <label class="form-field form-field-wide">
              <span>Specializations</span>
              <textarea
                v-model="profileForm.specializations"
                rows="4"
                placeholder="One specialization per line"
              />
            </label>

            <label class="form-field form-field-wide">
              <span>Working hours</span>
              <textarea
                v-model="profileForm.workingHours"
                rows="4"
                placeholder="One schedule line per row"
              />
            </label>

            <label class="form-field form-field-wide">
              <span>About</span>
              <textarea v-model="profileForm.about" rows="4" />
            </label>

            <p v-if="saveError" class="save-error form-field-wide" role="alert">{{ saveError }}</p>

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
.panel-head h2,
.edit-head h2 {
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
.record-item strong,
.list-item strong {
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

.list-block {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.9rem;
}

.list-item {
  display: grid;
  gap: 0.32rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 1rem;
}

.about-item {
  margin-top: 0.9rem;
  line-height: 1.7;
}

.edit-modal-shell {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.38);
  overflow-y: auto;
}

.edit-modal {
  width: min(100%, 760px);
  max-height: calc(100vh - 2.5rem);
  border: 1px solid #dbe2ea;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.16);
  padding: 1.25rem;
  overflow-y: auto;
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

.photo-preview {
  display: grid;
  gap: 0.45rem;
}

.photo-preview-box {
  display: grid;
  width: 96px;
  height: 96px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #dbe2ea;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  color: #3157b7;
  font-size: 1.2rem;
  font-weight: 700;
}

.photo-preview-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

  .record-column {
    gap: 1.25rem;
  }

  .summary-card,
  .record-panel {
    padding: 1.5rem;
  }
}
</style>
