<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  createDoctorService,
  deleteDoctorService,
  getDoctorServices,
  updateDoctorService,
} from '../../services/serviceApi'

const services = ref([])
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const isSaving = ref(false)
const searchTerm = ref('')
const activeEditor = ref('')

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

const filteredServices = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  if (!query) {
    return services.value
  }

  return services.value.filter((service) =>
    [service.name, service.category, service.description, service.price]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const resetForm = () => {
  serviceForm.name = ''
  serviceForm.category = ''
  serviceForm.duration = ''
  serviceForm.price = ''
  serviceForm.description = ''
  serviceForm.overview = ''
  serviceForm.preparation = ''
  serviceForm.includesText = ''
  serviceForm.available = true
}

const loadServices = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    services.value = await getDoctorServices()
  } catch (error) {
    loadError.value = error.message || 'Unable to load services.'
  } finally {
    isLoading.value = false
  }
}

const openCreate = () => {
  resetForm()
  saveError.value = ''
  activeEditor.value = 'create'
}

const closeEditor = () => {
  activeEditor.value = ''
  saveError.value = ''
}

const buildPayload = () => ({
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

const sanitizeNumberInput = (field) => {
  serviceForm[field] = numericOnly(serviceForm[field])
}

const saveService = async () => {
  saveError.value = ''
  isSaving.value = true

  try {
    await createDoctorService(buildPayload())

    await loadServices()
    closeEditor()
  } catch (error) {
    saveError.value = error.message || 'Unable to save service.'
  } finally {
    isSaving.value = false
  }
}

const toggleAvailability = async (service) => {
  try {
    const updated = await updateDoctorService(service.id, {
      name: service.name,
      category: service.category,
      duration: numericOnly(service.duration),
      price: numericOnly(service.price),
      description: service.description,
      overview: service.overview,
      preparation: service.preparation,
      includes: service.includes,
      available: !service.available,
    })

    services.value = services.value.map((item) => (item.id === updated.id ? updated : item))
  } catch (error) {
    loadError.value = error.message || 'Unable to update service availability.'
  }
}

const removeService = async (service) => {
  const confirmed = window.confirm(`Delete ${service.name}? This will remove the service from the clinic list.`)
  if (!confirmed) return

  try {
    await deleteDoctorService(service.id)
    services.value = services.value.filter((item) => item.id !== service.id)
  } catch (error) {
    loadError.value = error.message || 'Unable to delete service.'
  }
}

onMounted(loadServices)
</script>

<template>
  <section class="doctor-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Services</p>
        <h1>Manage clinic services</h1>
        <p class="muted-copy">
          Add new services, update service details, and control what patients can book.
        </p>
      </div>

      <div class="hero-actions">
        <label class="search-field">
          <span class="sr-only">Search services</span>
          <input v-model="searchTerm" type="search" placeholder="Search services" />
        </label>
        <button class="primary-button" type="button" @click="openCreate">Add service</button>
      </div>
    </section>

    <section v-if="isLoading" class="state-panel">
      <p class="section-label">Services</p>
      <h2>Loading services</h2>
      <p class="muted-copy">Fetching the latest clinic services from Supabase.</p>
    </section>

    <section v-else-if="loadError" class="state-panel">
      <p class="section-label">Services</p>
      <h2>Unable to load services</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <section v-else-if="!filteredServices.length" class="state-panel">
      <p class="section-label">Services</p>
      <h2>No services found</h2>
      <p class="muted-copy">Try another search or add a new service.</p>
    </section>

    <section v-else class="services-grid">
      <article v-for="service in filteredServices" :key="service.id" class="service-card">
        <div class="service-head">
          <div class="service-meta">
            <span class="service-badge">{{ service.category }}</span>
            <span :class="['availability-badge', { unavailable: !service.available }]">
              {{ service.available ? 'Available' : 'Unavailable' }}
            </span>
          </div>

          <button class="ghost-button" type="button" @click="toggleAvailability(service)">
            {{ service.available ? 'Disable booking' : 'Enable booking' }}
          </button>
        </div>

        <div class="service-main">
          <h2>{{ service.name }}</h2>
          <p class="service-description">{{ service.description || 'No short description added.' }}</p>
        </div>

        <div class="service-facts">
          <article class="fact-item">
            <span>Duration</span>
            <strong>{{ service.duration }}</strong>
          </article>
          <article class="fact-item">
            <span>Price</span>
            <strong>{{ service.price || 'Not set' }}</strong>
          </article>
        </div>

        <div class="service-actions">
          <RouterLink
            class="secondary-button"
            :to="{ name: 'admin-service-details', params: { id: service.id } }"
          >
            View details
          </RouterLink>
          <button class="danger-button" type="button" @click="removeService(service)">Delete</button>
        </div>
      </article>
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
            <h2>{{ activeEditor === 'create' ? 'Add service' : 'Edit service' }}</h2>
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
            <textarea
              v-model="serviceForm.includesText"
              rows="4"
              placeholder="One item per line"
            />
          </label>

          <label class="availability-field form-field-wide">
            <input v-model="serviceForm.available" type="checkbox" />
            <span>Service is available for booking</span>
          </label>

          <p v-if="saveError" class="save-error" role="alert">{{ saveError }}</p>

          <div class="edit-actions">
            <button class="modal-secondary" type="button" @click="closeEditor">Cancel</button>
          <button class="modal-primary" type="submit" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Create service' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.doctor-page,
.hero-copy,
.services-grid,
.service-card,
.service-main,
.service-facts {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.state-panel,
.service-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.hero-panel,
.state-panel,
.service-card {
  padding: 1.25rem;
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
}

.hero-copy {
  gap: 0.35rem;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-copy h1,
.service-main h2 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.service-description,
.fact-item span {
  color: #6b7280;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-field input,
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

.search-field input {
  min-width: 220px;
}

.search-field input:focus,
.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #9db3ff;
  box-shadow: 0 0 0 3px rgba(91, 97, 255, 0.12);
}

.primary-button,
.secondary-button,
.danger-button,
.ghost-button,
.modal-secondary,
.modal-primary,
.modal-close {
  cursor: pointer;
}

.primary-button,
.modal-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 1px solid #4a56c9;
  border-radius: 10px;
  background: #4a56c9;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.7rem 1rem;
}

.primary-button:hover,
.modal-primary:hover {
  background: #3f4fb3;
  border-color: #3f4fb3;
}

.services-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.service-card {
  grid-template-rows: auto 1fr auto auto;
}

.service-head,
.service-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.service-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.service-badge,
.availability-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
}

.service-badge {
  background: #e8f0ff;
  color: #3157b7;
}

.availability-badge {
  background: #ecfdf3;
  color: #15803d;
}

.availability-badge.unavailable {
  background: #fff1f2;
  color: #be123c;
}

.ghost-button,
.secondary-button,
.danger-button,
.modal-secondary {
  min-height: 40px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 0.95rem;
}

.ghost-button,
.secondary-button,
.modal-secondary {
  border: 1px solid #d7e3fb;
  background: #f5f8ff;
  color: #3157b7;
}

.ghost-button:hover,
.secondary-button:hover,
.modal-secondary:hover {
  border-color: #bfd0f7;
  background: #eef4ff;
  color: #27479b;
}

.danger-button {
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #be123c;
}

.danger-button:hover {
  border-color: #fda4af;
  background: #ffe4e6;
}

.service-main {
  gap: 0.6rem;
}

.service-main h2 {
  font-size: 1.2rem;
  line-height: 1.12;
}

.service-description {
  line-height: 1.55;
}

.service-facts {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid #eef2f7;
  padding-top: 1rem;
}

.fact-item {
  display: grid;
  gap: 0.24rem;
}

.fact-item strong {
  color: #111827;
  font-weight: 600;
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

.form-field span {
  color: #4b5563;
  font-size: 0.88rem;
  font-weight: 600;
}

.form-field textarea {
  resize: vertical;
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 980px) {
  .hero-panel,
  .hero-actions,
  .service-head,
  .service-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field input {
    min-width: 0;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 760px) {
  .edit-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-field-wide {
    grid-column: 1 / -1;
  }
}
</style>
