<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getServiceById, updateDoctorService } from '../../services/serviceApi'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const service = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const activeEditor = ref(false)
const saveError = ref('')
const isSaving = ref(false)

const serviceForm = reactive({
  name: '',
  category: '',
  duration: '',
  price: '',
  description: '',
  overview: '',
  preparation: '',
  includesText: '',
  available: true,
})

const numericOnly = (value) => String(value || '').replace(/[^\d.]/g, '')

const includedItems = computed(() => service.value?.includes || [])

const loadService = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    service.value = await getServiceById(props.id)
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load service details right now.'
  } finally {
    isLoading.value = false
  }
}

const populateForm = () => {
  serviceForm.name = service.value?.name || ''
  serviceForm.category = service.value?.category || ''
  serviceForm.duration = numericOnly(service.value?.duration)
  serviceForm.price = numericOnly(service.value?.price)
  serviceForm.description = service.value?.description || ''
  serviceForm.overview = service.value?.overview || ''
  serviceForm.preparation = service.value?.preparation || ''
  serviceForm.includesText = Array.isArray(service.value?.includes) ? service.value.includes.join('\n') : ''
  serviceForm.available = service.value?.available ?? true
}

const openEditor = () => {
  populateForm()
  saveError.value = ''
  activeEditor.value = true
}

const closeEditor = () => {
  activeEditor.value = false
  saveError.value = ''
}

const sanitizeNumberInput = (field) => {
  serviceForm[field] = numericOnly(serviceForm[field])
}

const saveService = async () => {
  if (!service.value) return

  saveError.value = ''
  isSaving.value = true

  try {
    service.value = await updateDoctorService(service.value.id, {
      name: serviceForm.name,
      category: serviceForm.category,
      duration: numericOnly(serviceForm.duration),
      price: numericOnly(serviceForm.price),
      description: serviceForm.description,
      overview: serviceForm.overview,
      preparation: serviceForm.preparation,
      includes: serviceForm.includesText,
      available: serviceForm.available,
    })

    closeEditor()
  } catch (error) {
    saveError.value = error.message || 'Unable to save service.'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadService)
</script>

<template>
  <section v-if="isLoading" class="state-panel">
    <p class="section-label">Service details</p>
    <h1>Loading service</h1>
    <p class="muted-copy">Fetching service details from the clinic database.</p>
  </section>

  <section v-else-if="errorMessage" class="state-panel">
    <p class="section-label">Service details</p>
    <h1>Unable to load service</h1>
    <p class="muted-copy">{{ errorMessage }}</p>
    <RouterLink class="secondary-link" :to="{ name: 'admin-services' }">Back to services</RouterLink>
  </section>

  <section v-else-if="service" class="service-details-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <div class="hero-meta">
          <span class="service-badge">{{ service.category }}</span>
          <span :class="['availability-chip', { unavailable: !service.available }]">
            {{ service.available ? 'Available' : 'Unavailable' }}
          </span>
        </div>

        <h1>{{ service.name }}</h1>
        <p class="muted-copy">{{ service.overview }}</p>
      </div>

      <div class="hero-actions">
        <RouterLink class="secondary-link" :to="{ name: 'admin-services' }">Back to services</RouterLink>
        <button class="primary-link" type="button" @click="openEditor">Edit</button>
      </div>
    </section>

    <section class="summary-strip">
      <article class="summary-item">
        <span>Duration</span>
        <strong>{{ service.duration }}</strong>
      </article>
      <article class="summary-item">
        <span>Price</span>
        <strong>{{ service.price }}</strong>
      </article>
    </section>

    <section class="panel details-card">
      <section class="content-block">
        <div class="block-head">
          <p class="section-label">Service details</p>
          <h2>Overview</h2>
        </div>
        <p class="content-copy">{{ service.description || service.overview }}</p>
      </section>

      <section class="content-block">
        <div class="block-head">
          <p class="section-label">Preparation</p>
          <h2>Before the visit</h2>
        </div>
        <p class="content-copy">{{ service.preparation }}</p>
      </section>

      <section class="content-block">
        <div class="block-head">
          <p class="section-label">Included</p>
          <h2>What this covers</h2>
        </div>

        <div class="included-list">
          <article v-for="item in includedItems" :key="item" class="included-row">
            <span class="included-dot" aria-hidden="true"></span>
            <strong>{{ item }}</strong>
          </article>
          <article v-if="!includedItems.length" class="included-row">
            <span class="included-dot" aria-hidden="true"></span>
            <strong>Details will be shared by the clinic</strong>
          </article>
        </div>
      </section>
    </section>

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
            <p class="section-label">Service details</p>
            <h2>Edit service</h2>
          </div>
          <button class="modal-close" type="button" aria-label="Close service form" @click="closeEditor">
            ×
          </button>
        </div>

        <form class="edit-form" @submit.prevent="saveService">
          <label class="form-field">
            <span>Service name</span>
            <input v-model="serviceForm.name" type="text" />
          </label>

          <label class="form-field">
            <span>Category</span>
            <input v-model="serviceForm.category" type="text" />
          </label>

          <label class="form-field">
            <span>Duration</span>
            <input
              v-model="serviceForm.duration"
              type="number"
              min="0"
              step="15"
              placeholder="15"
              @input="sanitizeNumberInput('duration')"
            />
          </label>

          <label class="form-field">
            <span>Price</span>
            <input
              v-model="serviceForm.price"
              type="number"
              min="0"
              step="1"
              placeholder="45"
              @input="sanitizeNumberInput('price')"
            />
          </label>

          <label class="form-field form-field-wide">
            <span>Short description</span>
            <textarea v-model="serviceForm.description" rows="2" />
          </label>

          <label class="form-field form-field-wide">
            <span>Service details</span>
            <textarea v-model="serviceForm.overview" rows="4" />
          </label>

          <label class="form-field form-field-wide">
            <span>Preparation</span>
            <textarea v-model="serviceForm.preparation" rows="3" />
          </label>

          <label class="form-field form-field-wide">
            <span>Included items</span>
            <textarea v-model="serviceForm.includesText" rows="4" placeholder="One item per line" />
          </label>

          <label class="availability-field form-field-wide">
            <input v-model="serviceForm.available" type="checkbox" />
            <span>Service is available for booking</span>
          </label>

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
  </section>

  <section v-else class="state-panel">
    <p class="section-label">Service details</p>
    <h1>Service not found</h1>
    <RouterLink class="secondary-link" :to="{ name: 'admin-services' }">Back to services</RouterLink>
  </section>
</template>

<style scoped>
.service-details-page,
.included-list,
.details-card {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel,
.state-panel,
.summary-strip {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.hero-panel,
.panel,
.state-panel,
.summary-strip {
  padding: 1.25rem;
}

.hero-panel {
  display: grid;
  gap: 1rem;
}

.hero-copy,
.hero-meta,
.block-head {
  display: grid;
  gap: 0.45rem;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-copy h1,
.block-head h2,
.state-panel h1 {
  color: #111827;
  font-weight: 700;
  letter-spacing: 0;
}

.hero-copy h1 {
  font-size: clamp(1.85rem, 4vw, 2.6rem);
  line-height: 1.02;
}

.muted-copy,
.summary-item span,
.content-copy {
  color: #6b7280;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.primary-link,
.secondary-link,
.modal-secondary,
.modal-primary,
.modal-close {
  cursor: pointer;
}

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

.primary-link,
.modal-primary {
  border: 1px solid #4a56c9;
  background: #4a56c9;
  color: #ffffff;
}

.secondary-link,
.modal-secondary {
  border: 1px solid #d7e3fb;
  background: #f5f8ff;
  color: #3157b7;
}

.primary-link:hover,
.modal-primary:hover {
  border-color: #3f4fb3;
  background: #3f4fb3;
}

.secondary-link:hover,
.modal-secondary:hover {
  border-color: #bfd0f7;
  background: #eef4ff;
  color: #27479b;
}

.service-badge,
.availability-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.38rem 0.72rem;
}

.service-badge {
  background: #eef2ff;
  color: #3f4fb3;
}

.availability-chip {
  background: #ecfdf3;
  color: #15803d;
}

.availability-chip.unavailable {
  background: #fff1f2;
  color: #be123c;
}

.summary-strip {
  display: grid;
  gap: 1rem;
}

.summary-item {
  display: grid;
  gap: 0.28rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.95rem;
}

.summary-item:first-child {
  border-top: 0;
  padding-top: 0;
}

.summary-item strong,
.included-row strong {
  color: #111827;
  font-weight: 700;
}

.details-card {
  gap: 1.25rem;
}

.content-block {
  display: grid;
  gap: 0.85rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.1rem;
}

.content-block:first-child {
  border-top: 0;
  padding-top: 0;
}

.content-copy {
  margin: 0;
  line-height: 1.65;
}

.included-list {
  gap: 0.85rem;
}

.included-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 0.75rem;
}

.included-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: #3157b7;
  margin-top: 0.35rem;
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
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.38);
}

.edit-modal {
  width: min(100%, 820px);
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

.form-field span,
.availability-field span {
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
}

.form-field textarea {
  resize: vertical;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #9db3ff;
  box-shadow: 0 0 0 3px rgba(91, 97, 255, 0.12);
}

.availability-field {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.availability-field input {
  width: 18px;
  height: 18px;
}

.save-error {
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 500;
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

.modal-primary {
  min-height: 42px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.modal-primary:disabled {
  border-color: #c7d2fe;
  background: #c7d2fe;
  cursor: wait;
}

.modal-secondary {
  min-height: 42px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
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

@media (min-width: 760px) {
  .hero-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-item {
    border-top: 0;
    border-left: 1px solid #f1f5f9;
    padding-top: 0;
    padding-left: 1rem;
  }

  .summary-item:first-child {
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

@media (max-width: 640px) {
  .hero-actions {
    align-items: start;
    flex-direction: column;
  }

  .hero-actions > * {
    width: 100%;
  }
}
</style>
