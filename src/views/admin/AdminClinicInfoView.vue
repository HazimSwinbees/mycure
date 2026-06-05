<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getClinicInfo, updateClinicInfo } from '../../services/clinicInfoApi'

const clinic = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const saveMessage = ref('')
const isSaving = ref(false)

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

      <div class="hero-mark">
        <span>Editable</span>
        <strong>Live database</strong>
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
        <aside class="overview-stack">
          <section class="panel overview-panel">
            <div class="overview-card">
              <p class="section-label">Current overview</p>
              <h2>{{ clinic?.clinicName }}</h2>
              <p class="overview-tagline">{{ clinic?.tagline }}</p>
              <p class="overview-description">{{ clinic?.description }}</p>
            </div>

            <div class="summary-grid">
              <article v-for="item in summaryItems" :key="item.label" class="summary-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>
          </section>

          <section class="panel note-panel">
            <p class="section-label">Emergency note</p>
            <h2>Patient-facing guidance</h2>
            <p class="muted-copy">{{ clinic?.emergencyNote }}</p>
          </section>
        </aside>

        <section class="panel form-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Edit clinic info</p>
              <h2>Update clinic details</h2>
            </div>
          </div>

          <form class="form-grid" @submit.prevent="saveClinicInfo">
            <label class="field field-wide">
              <span>Clinic name</span>
              <input v-model="form.clinicName" type="text" placeholder="Enter clinic name" />
            </label>

            <label class="field field-wide">
              <span>Tagline</span>
              <input v-model="form.tagline" type="text" placeholder="Short clinic tagline" />
            </label>

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

            <label class="field field-wide">
              <span>Description</span>
              <textarea
                v-model="form.description"
                rows="5"
                placeholder="Describe the clinic and care focus"
              />
            </label>

            <label class="field field-wide">
              <span>Emergency note</span>
              <textarea
                v-model="form.emergencyNote"
                rows="4"
                placeholder="Add urgent care instructions"
              />
            </label>

            <p v-if="saveError" class="feedback error-text" role="alert">{{ saveError }}</p>
            <p v-else-if="saveMessage" class="feedback success-text">{{ saveMessage }}</p>

            <div class="action-row">
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
.overview-stack,
.content-grid,
.summary-grid,
.form-grid {
  display: grid;
  gap: 1rem;
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
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.14), transparent 36%),
    linear-gradient(180deg, #ffffff 0%, #f8fffd 100%);
}

.hero-copy,
.overview-card,
.field {
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
.overview-card h2,
.note-panel h2 {
  color: #111827;
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
.field span {
  color: #6b7280;
}

.hero-mark {
  display: inline-grid;
  justify-self: start;
  gap: 0.15rem;
  border: 1px solid #c7ece7;
  border-radius: 16px;
  background: #f0fdfa;
  color: #115e59;
  padding: 0.9rem 1rem;
}

.hero-mark span {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.hero-mark strong {
  font-size: 1rem;
}

.overview-panel,
.form-panel {
  align-content: start;
}

.overview-card {
  padding: 1rem;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fffd 0%, #f3f7ff 100%);
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
}

.summary-item {
  display: grid;
  gap: 0.28rem;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: #ffffff;
  padding: 1rem;
}

.summary-item strong {
  color: #111827;
  font-weight: 600;
  overflow-wrap: anywhere;
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

.field input,
.field textarea {
  width: 100%;
  border: 1px solid #dbe2ea;
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
  border-color: #9dd9d0;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
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
  color: #0f766e;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 1px solid #0f766e;
  border-radius: 12px;
  background: #0f766e;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.primary-action:disabled {
  cursor: wait;
  opacity: 0.7;
}

@media (min-width: 900px) {
  .content-grid {
    grid-template-columns: minmax(320px, 0.85fr) minmax(0, 1.15fr);
  }

  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .action-row {
    justify-content: stretch;
  }

  .primary-action {
    width: 100%;
  }
}
</style>
