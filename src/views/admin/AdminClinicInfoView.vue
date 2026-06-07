<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getClinicInfo, updateClinicInfo } from '../../services/clinicInfoApi'

const clinic = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const saveMessage = ref('')
const isSaving = ref(false)
const activeEditor = ref(false)

const form = reactive({
  clinicName: '',
  tagline: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  operatingHours: '',
  website: '',
  description: '',
  emergencyNote: '',
})

const summaryItems = computed(() => [
  { label: 'Email', value: clinic.value?.email || '-' },
  { label: 'Phone', value: clinic.value?.phone || '-' },
  { label: 'Hours', value: clinic.value?.operatingHours || '-' },
  { label: 'Website', value: clinic.value?.website || '-' },
])

const applyForm = (value) => {
  form.clinicName = value?.clinicName || ''
  form.tagline = value?.tagline || ''
  form.email = value?.email || ''
  form.phone = value?.phone || ''
  form.addressLine1 = value?.addressLine1 || ''
  form.addressLine2 = value?.addressLine2 || ''
  form.operatingHours = value?.operatingHours || ''
  form.website = value?.website || ''
  form.description = value?.description || ''
  form.emergencyNote = value?.emergencyNote || ''
}

const openEditor = () => {
  if (!clinic.value) return

  applyForm(clinic.value)
  saveError.value = ''
  saveMessage.value = ''
  activeEditor.value = true
}

const closeEditor = () => {
  if (isSaving.value) return

  activeEditor.value = false
  saveError.value = ''
}

const loadClinicInfo = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    clinic.value = await getClinicInfo()
    applyForm(clinic.value)
  } catch (error) {
    loadError.value = error.message || 'Unable to load clinic information.'
  } finally {
    isLoading.value = false
  }
}

const saveClinicInfo = async () => {
  isSaving.value = true
  saveError.value = ''
  saveMessage.value = ''

  try {
    clinic.value = await updateClinicInfo({ ...form })
    applyForm(clinic.value)
    saveMessage.value = 'Clinic information saved successfully.'
    activeEditor.value = false
  } catch (error) {
    saveError.value = error.message || 'Unable to save clinic information.'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadClinicInfo)
</script>

<template>
  <section class="clinic-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Clinic info</p>
        <h1>{{ clinic?.clinicName || 'Clinic information' }}</h1>
        <p class="muted-copy">
          Keep the clinic’s public-facing contact details, operating hours, and care summary up to
          date for the rest of the platform.
        </p>
      </div>

    </section>

    <section v-if="isLoading" class="panel state-panel">
      <p class="section-label">Clinic info</p>
      <h2>Loading clinic details</h2>
    </section>

    <section v-else-if="loadError" class="panel state-panel">
      <p class="section-label">Clinic info</p>
      <h2>Unable to load clinic details</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <template v-else>
      <div class="content-grid">
        <section class="panel overview-panel">
            <div class="overview-card clinic-card">
              <div class="overview-head">
                <div>
                  <p class="section-label">Current overview</p>
                  <h2>{{ clinic?.clinicName }}</h2>
                </div>
                <div class="overview-actions">
                  <span class="clinic-chip">Public info</span>
                  <button class="secondary-action" type="button" @click="openEditor">Edit clinic info</button>
                </div>
              </div>

              <p class="overview-tagline">{{ clinic?.tagline }}</p>
              <p class="overview-description">{{ clinic?.description }}</p>
            </div>

            <div class="summary-grid">
              <article v-for="item in summaryItems" :key="item.label" class="summary-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>

            <div class="address-card">
              <p class="section-label">Location</p>
              <strong>{{ clinic?.addressLine1 || 'Address not set' }}</strong>
              <p>{{ clinic?.addressLine2 || 'City, state, and postcode not set' }}</p>
            </div>
        </section>
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
              <p class="section-label">Edit clinic info</p>
              <h2>Update clinic details</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Close edit form" @click="closeEditor">
              x
            </button>
          </div>

          <form class="form-grid" @submit.prevent="saveClinicInfo">
            <section class="form-section field-wide">
              <div class="form-section-head">
                <p class="section-label">Identity</p>
                <h3>Clinic profile</h3>
              </div>

              <div class="section-grid">
                <label class="field field-wide">
                  <span>Clinic name</span>
                  <input v-model="form.clinicName" type="text" placeholder="Enter clinic name" />
                </label>

                <label class="field field-wide">
                  <span>Tagline</span>
                  <input v-model="form.tagline" type="text" placeholder="Short clinic tagline" />
                </label>

                <label class="field field-wide">
                  <span>Description</span>
                  <textarea
                    v-model="form.description"
                    rows="5"
                    placeholder="Describe the clinic and care focus"
                  />
                </label>
              </div>
            </section>

            <section class="form-section field-wide">
              <div class="form-section-head">
                <p class="section-label">Contact</p>
                <h3>Public details</h3>
              </div>

              <div class="section-grid">
                <label class="field">
                  <span>Email</span>
                  <input v-model="form.email" type="email" placeholder="Enter clinic email" />
                </label>

                <label class="field">
                  <span>Phone</span>
                  <input v-model="form.phone" type="text" placeholder="Enter clinic phone number" />
                </label>

                <label class="field field-wide">
                  <span>Address line 1</span>
                  <input v-model="form.addressLine1" type="text" placeholder="Street address" />
                </label>

                <label class="field field-wide">
                  <span>Address line 2</span>
                  <input v-model="form.addressLine2" type="text" placeholder="City, state, postcode" />
                </label>

                <label class="field">
                  <span>Operating hours</span>
                  <input v-model="form.operatingHours" type="text" placeholder="Operating schedule" />
                </label>

                <label class="field">
                  <span>Website</span>
                  <input v-model="form.website" type="text" placeholder="Website URL" />
                </label>
              </div>
            </section>

            <p v-if="saveError" class="feedback error-text" role="alert">{{ saveError }}</p>
            <p v-else-if="saveMessage" class="feedback success-text">{{ saveMessage }}</p>

            <div class="action-row">
              <button class="secondary-action" type="button" @click="closeEditor">Cancel</button>
              <button class="primary-action" type="submit" :disabled="isSaving">
                {{ isSaving ? 'Saving clinic info...' : 'Save clinic info' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.clinic-page,
.summary-grid,
.form-grid,
.form-section,
.section-grid {
  display: grid;
  gap: 1.25rem;
}

.hero-panel,
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.hero-panel,
.panel {
  padding: 1.25rem;
}

.hero-panel {
  display: grid;
  gap: 1rem;
  background:
    radial-gradient(circle at top right, rgba(74, 86, 201, 0.14), transparent 36%),
    linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.hero-copy,
.overview-card,
.field {
  display: grid;
  gap: 0.45rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  width: 100%;
  max-width: none;
}

.section-label {
  color: #6f7d90;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1,
.panel-head h2,
.overview-card h2,
.form-section-head h3 {
  color: #14213d;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.05;
}

.muted-copy,
.overview-tagline,
.overview-description,
.summary-item span,
.field span,
.address-card p {
  color: #607086;
}

.overview-panel,
.form-panel {
  align-content: start;
  width: 100%;
}

.clinic-card,
.form-section,
.address-card {
  padding: 1rem;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #f3f7ff 100%);
  border: 1px solid #e3ebf5;
}

.overview-head,
.form-section-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.overview-card {
  padding: 1.2rem 1.2rem 1.25rem;
}

.overview-tagline {
  margin-top: 0.35rem;
}

.overview-description {
  margin-top: 0.25rem;
  line-height: 1.7;
}

.overview-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.clinic-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border: 1px solid #d7e3fb;
  border-radius: 999px;
  background: #ffffff;
  color: #3157b7;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
}

.overview-tagline {
  font-size: 1rem;
  font-weight: 600;
}

.overview-description {
  line-height: 1.7;
}

.summary-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem 1.2rem;
}

.summary-item {
  display: grid;
  gap: 0.35rem;
  border: 1px solid #e3ebf5;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
  padding: 1.1rem;
}

.summary-item strong {
  color: #14213d;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.address-card {
  gap: 0.35rem;
  margin-top: 0.15rem;
}

.address-card strong {
  color: #14213d;
  font-weight: 600;
}

.panel-head,
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.form-grid {
  margin-top: 0.9rem;
}

.form-section {
  gap: 0.9rem;
}

.form-section-head h3 {
  font-size: 1.05rem;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid #d7e3f2;
  border-radius: 12px;
  background: #ffffff;
  color: #111827;
  font: inherit;
  padding: 0.85rem 0.95rem;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #9bb7f1;
  box-shadow: 0 0 0 3px rgba(49, 87, 183, 0.12);
}

.field-wide {
  grid-column: 1 / -1;
}

.feedback {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.error-text {
  color: #b91c1c;
}

.success-text {
  color: #3157b7;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 1px solid #3157b7;
  border-radius: 12px;
  background: #3157b7;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 1px solid #d7e3fb;
  border-radius: 12px;
  background: #f5f8ff;
  color: #3157b7;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
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

.primary-action:disabled {
  cursor: wait;
  opacity: 0.7;
}

@media (min-width: 900px) {
  .section-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }
}

@media (max-width: 640px) {
  .overview-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .secondary-action {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .overview-head,
  .form-section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-row {
    justify-content: stretch;
  }

  .primary-action {
    width: 100%;
  }

  .edit-modal {
    padding: 1rem;
  }
}
</style>
